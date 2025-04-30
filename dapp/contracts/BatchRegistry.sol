// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IBatchRegistry.sol";
import "./interfaces/IShipmentTracker.sol";

/**
 * @title BatchRegistry
 * @dev Handles the creation and management of product batches
 */
contract BatchRegistry is Pausable, Ownable, ReentrancyGuard, IBatchRegistry {
    
    uint256 public batchCounter;
    mapping(uint256 => Batch) public batches;
    mapping(address => uint256[]) public userBatches;
    address public transactionManager;
    address public shipmentTracker;

    modifier onlyBatchOwner(uint256 _batchId) {
        require(batches[_batchId].creator == msg.sender, "Not batch owner");
        _;
    }

    modifier onlyBatchOwnerOrTransactionManager(uint256 _batchId) {
        require(
            batches[_batchId].creator == msg.sender || 
            msg.sender == transactionManager,
            "Not authorized: neither batch owner nor transaction manager"
        );
        _;
    }

    
    modifier batchExists(uint256 _batchId) {
        require(_batchId > 0 && _batchId <= batchCounter, "Batch does not exist");
        _;
    }
    
    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }

    modifier onlyTransactionManager() {
        require(msg.sender == transactionManager, "Not authorized");
        _;
    }

    modifier onlyShipmentTracker() {
        require(msg.sender == shipmentTracker, "Not ShipmentTracker");
        _;
    }   

    constructor() Ownable(msg.sender) {}
    
    function createBatch(bool _isForSale, uint256 _price, string memory _location, uint256 _quantity) external whenNotPaused returns (uint256) {
        require(_quantity > 0, "Invalid quantity");
        
        batchCounter++;
        
        batches[batchCounter] = Batch({
            parentId: 0,
            creator: msg.sender,
            location: _location,
            quantity: _quantity,
            available: _quantity,
            isForSale: _isForSale,
            price: _price,
            originId: batchCounter,  // Self as origin
            state: BatchState.Available,
            pendingOwner: address(0),
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp
        });

        userBatches[msg.sender].push(batchCounter);
        emit BatchCreated(batchCounter, 0, msg.sender, _quantity, block.timestamp);
        
        if (_isForSale) {
            emit BatchListed(batchCounter, _price, block.timestamp);
        }
        
        return batchCounter;
    }
    
    function transformBatch(
        uint256 _sourceBatchId, 
        uint256 _newQuantity, 
        string memory _newLocation, 
        string memory _transformationDetails
    ) external whenNotPaused nonReentrant batchExists(_sourceBatchId) returns (uint256) {
        Batch storage sourceBatch = batches[_sourceBatchId];
        require(sourceBatch.creator == msg.sender, "Not owner");
        require(sourceBatch.available > 0, "No available quantity");
        require(sourceBatch.state == BatchState.Available, "Batch not available");
        
        // Create a new transformed batch
        batchCounter++;
        uint256 newBatchId = batchCounter;
        
        batches[newBatchId] = Batch({
            parentId: _sourceBatchId,
            creator: msg.sender,
            location: _newLocation,
            quantity: _newQuantity,
            available: _newQuantity,
            isForSale: false,
            price: 0,
            originId: sourceBatch.originId,  // Keep original origin
            state: BatchState.Available,
            pendingOwner: address(0),
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp
        });
        
        // Reduce available quantity from source batch
        sourceBatch.available -= _newQuantity;
        sourceBatch.lastUpdatedAt = block.timestamp;
            
        IShipmentTracker shipmentTrackerContract = IShipmentTracker(shipmentTracker);
        shipmentTrackerContract.addShipment(
            newBatchId,
            sourceBatch.location,
            _newLocation,
            _transformationDetails
        );
        shipmentTrackerContract.completeLeg(newBatchId, 0); 

        // Add to user batches
        userBatches[msg.sender].push(newBatchId);
        
        emit BatchCreated(newBatchId, _sourceBatchId, msg.sender, _newQuantity, block.timestamp);
        emit BatchTransformed(_sourceBatchId, newBatchId, _transformationDetails, block.timestamp);
        
        return newBatchId;
    }
    
    function transformBatchForPurchase(
        uint256 _sourceBatchId,
        uint256 _newQuantity,
        address _buyer,
        string memory _transformationDetails
    ) external whenNotPaused nonReentrant onlyTransactionManager batchExists(_sourceBatchId) returns (uint256) {
        Batch storage sourceBatch = batches[_sourceBatchId];

        require(sourceBatch.available >= _newQuantity, "Not enough quantity");
        require(sourceBatch.state == BatchState.Available, "Batch not available");

        batchCounter++;
        uint256 newBatchId = batchCounter;

        batches[newBatchId] = Batch({
            parentId: _sourceBatchId,
            creator: sourceBatch.creator,
            location: sourceBatch.location,
            quantity: _newQuantity,
            available: _newQuantity,
            isForSale: false,
            price: 0,
            originId: sourceBatch.originId,
            state: BatchState.Purchased, // ⬅️ Marked as purchased immediately
            pendingOwner: _buyer,         // ⬅️ Assign buyer as pending owner
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp
        });

        sourceBatch.available -= _newQuantity;
        if(sourceBatch.available == 0) {
            sourceBatch.isForSale = false;            
        }
        sourceBatch.lastUpdatedAt = block.timestamp;

        userBatches[sourceBatch.creator].push(newBatchId);

        emit BatchCreated(newBatchId, _sourceBatchId, sourceBatch.creator, _newQuantity, block.timestamp);
        emit BatchTransformed(_sourceBatchId, newBatchId, _transformationDetails, block.timestamp);
        emit BatchStateUpdated(newBatchId, BatchState.Available, BatchState.Purchased, block.timestamp);

        return newBatchId;
    }


    function toggleSale(uint256 _batchId, bool _isForSale, uint256 _price) external  batchExists(_batchId) 
        onlyBatchOwner(_batchId) {
        Batch storage batch = batches[_batchId];
        require(_price > 0 || !_isForSale, "Invalid price");
        require(batch.available > 0 || !_isForSale, "Nothing to sell");
        require(batch.state == BatchState.Available, "Batch not available");
        
        batch.isForSale = _isForSale;
        batch.lastUpdatedAt = block.timestamp;

        if (_isForSale) {
            batch.price = _price;
            emit BatchListed(_batchId, _price, block.timestamp);
        }
    }
    
    function transferBatchOwnership(uint256 _batchId, address _newOwner) external batchExists(_batchId) 
        onlyBatchOwnerOrTransactionManager(_batchId) validAddress(_newOwner) {
        Batch storage batch = batches[_batchId];
        
        // Add batch to new owner's list
        userBatches[_newOwner].push(_batchId);
        
        // Update batch ownership
        address oldOwner = batch.creator;
        batch.creator = _newOwner;
        batch.state = BatchState.Available; // Reset state for new owner
        batch.pendingOwner = address(0);
        batch.lastUpdatedAt = block.timestamp;
        
        emit BatchTransferred(_batchId, oldOwner, _newOwner, block.timestamp);
    }
    
    function getUserBatches(address _user) external view returns (uint256[] memory) {
        return userBatches[_user];
    }
    
    function updateBatchState(uint256 _batchId, BatchState _newState) external batchExists(_batchId){
        Batch storage batch = batches[_batchId];
        require(batch.creator == msg.sender || msg.sender == owner() || msg.sender == shipmentTracker, "Not authorized");
        BatchState oldState = batch.state;
        batch.state = _newState;
        batch.lastUpdatedAt = block.timestamp;
        
        emit BatchStateUpdated(_batchId, oldState, _newState, block.timestamp);
    }
    
    function updateBatchLocation(uint256 _batchId, string memory _newLocation) external batchExists(_batchId) {
        Batch storage batch = batches[_batchId];
        require(batch.creator == msg.sender || msg.sender == owner() || msg.sender == shipmentTracker, "Not authorized");
        
        string memory oldLocation = batch.location;
        batch.location = _newLocation;
        batch.lastUpdatedAt = block.timestamp;
        
        emit BatchLocationUpdated(_batchId, oldLocation, _newLocation, block.timestamp);

    }
    
    function setPendingOwner(uint256 _batchId, address _pendingOwner) external batchExists(_batchId)
        validAddress(_pendingOwner) {
        Batch storage batch = batches[_batchId];
        require(batch.creator == msg.sender || msg.sender == owner(), "Not authorized");
        batch.pendingOwner = _pendingOwner;
    }

    function getBatch(uint256 _batchId) external view returns (Batch memory) {
        return batches[_batchId];
    }
    
    function setTransactionManager(address _txManager) external onlyOwner {
        require(transactionManager == address(0), "Already set");
        transactionManager = _txManager;
    }

    function setShipmentTracker(address _tracker) external onlyOwner {
        require(shipmentTracker == address(0), "Already set");
        shipmentTracker = _tracker;
    }


    // Admin functions
    function pauseRegistry() external onlyOwner {
        _pause();
    }

    function unpauseRegistry() external onlyOwner {
        _unpause();
    }
}