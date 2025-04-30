// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./interfaces/IBatchRegistry.sol"; 
import "./interfaces/IShipmentTracker.sol";
import "./interfaces/ITransactionManager.sol";

/**
 * @title TransactionManager
 * @dev Manages purchases and transactions between buyers and sellers
 */
contract TransactionManager is Pausable, Ownable, ReentrancyGuard, ITransactionManager {
    
    IBatchRegistry public batchRegistry;
    IShipmentTracker public shipmentTracker;

    uint256 public txCounter;
    uint256 public disputePeriod = 7 days;

    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userTxs;
    mapping(uint256 => uint256) public batchToTransaction;

    constructor(address _batchRegistryAddress, address _shipmentTrackerAddress) Ownable(msg.sender) {
        batchRegistry = IBatchRegistry(_batchRegistryAddress);
        shipmentTracker = IShipmentTracker(_shipmentTrackerAddress);
    }
    
    modifier validTxId(uint256 _txId) {
        require(_txId > 0 && _txId <= txCounter, "Invalid transaction ID");
        _;
    }

    function buyBatch(uint256 _batchId, uint256 _quantity) external payable whenNotPaused nonReentrant {
        // Get the batch data
        // For direct access to the enum type

        IBatchRegistry.Batch memory batch = batchRegistry.getBatch(_batchId);

        require(batch.isForSale, "Not for sale");
        require(batch.available >= _quantity, "Not enough available");
        require(batch.creator != msg.sender, "Can't buy own batch");
        require(_quantity > 0, "Invalid quantity");
        require(batch.state == IBatchRegistry.BatchState.Available, "Batch not available");
        // Check contract has sufficient balance
        uint256 currentBalance = address(this).balance - msg.value;
        require(currentBalance + msg.value >= currentBalance, "Balance overflow");

        uint256 cost = batch.price * _quantity;
        require(msg.value >= cost, "Insufficient funds");

        uint256 newBatchId = _batchId;
        
        // If partial purchase, create a new batch
        if (_quantity < batch.available) {
            newBatchId = batchRegistry.transformBatchForPurchase(_batchId, _quantity, msg.sender, "Partial purchase split");
        }
        
        // Record transaction
        txCounter++;
        transactions[txCounter] = Transaction({
            batchId: newBatchId,
            buyer: msg.sender,
            seller: batch.creator,
            price: cost,
            quantity: _quantity,
            status: Status.NotShipped,
            disputeTimeoutTimestamp: 0
        });
        
        // Update user records
        userTxs[msg.sender].push(txCounter);
        userTxs[batch.creator].push(txCounter);

        batchToTransaction[newBatchId] = txCounter;
        
        // Emit events
        emit BatchPurchased(newBatchId, txCounter, msg.sender);
        
        // Return excess payment if any
        if (msg.value > cost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }
    }
    
    function confirmPurchase(uint256 _txId) external nonReentrant validTxId(_txId){
        Transaction storage tx = transactions[_txId];
        
        
        IBatchRegistry.Batch memory batch = batchRegistry.getBatch(tx.batchId);
        
        require(tx.buyer == msg.sender, "Not buyer");
        require(tx.status == Status.Delivered, "Not delivered");
        require(batch.state == IBatchRegistry.BatchState.Delivered, "Batch not delivered");
        
        // Update status
        tx.status = Status.Confirmed;
        emit TransactionStateChanged(_txId, Status.Confirmed);
        
        // Transfer ownership
        batchRegistry.transferBatchOwnership(tx.batchId, tx.buyer);
        
        // Transfer payment to seller
        (bool success, ) = payable(tx.seller).call{value: tx.price}("");
        require(success, "Transfer failed");
        
        emit PurchaseConfirmed(_txId, tx.buyer, tx.seller, tx.price);
    }
    
    function disputePurchase(uint256 _txId) external {
        Transaction storage tx = transactions[_txId];
        require(tx.buyer == msg.sender, "Not buyer");
        require(tx.status == Status.Delivered, "Not delivered");
        
        tx.status = Status.Disputed;
        emit TransactionStateChanged(_txId, Status.Disputed);
        emit PurchaseDisputed(_txId, msg.sender);
    }
    
    function autoReleaseEscrow(uint256 _txId) external nonReentrant validTxId(_txId){
        Transaction storage tx = transactions[_txId];
        require(tx.status == Status.Delivered, "Not delivered");
        require(tx.disputeTimeoutTimestamp > 0, "No timeout set");
        require(block.timestamp > tx.disputeTimeoutTimestamp, "Dispute period active");
        
        // Automatically confirm purchase after dispute period expires
        tx.status = Status.Confirmed;
        emit TransactionStateChanged(_txId, Status.Confirmed);
        
        // Transfer ownership
        batchRegistry.transferBatchOwnership(tx.batchId, tx.buyer);
        
        // Transfer payment to seller
        (bool success, ) = payable(tx.seller).call{value: tx.price}("");
        require(success, "Transfer failed");
        
        emit PurchaseConfirmed(_txId, tx.buyer, tx.seller, tx.price);
    }
    
    function updateTransactionStatus(uint256 _txId, Status _newStatus) external validTxId(_txId) {
        Transaction storage tx = transactions[_txId];
        require(tx.seller == msg.sender || tx.buyer == msg.sender || msg.sender == address(shipmentTracker), "Not authorized");

        tx.status = _newStatus;
        
        // Update dispute timeout if status is Delivered
        if (_newStatus == Status.Delivered) {
            tx.disputeTimeoutTimestamp = block.timestamp + disputePeriod;
        }
        
        emit TransactionStateChanged(_txId, _newStatus);
    }
    
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTxs[_user];
    }
    
    function setDisputePeriod(uint256 _newPeriod) external onlyOwner {
        require(_newPeriod >= 1 days && _newPeriod <= 30 days, "Invalid period");
        uint256 oldPeriod = disputePeriod;
        disputePeriod = _newPeriod;
        emit DisputePeriodChanged(oldPeriod, _newPeriod);
    }
    
    function getBatchTransaction(uint256 _batchId) external view returns (uint256) {
        return batchToTransaction[_batchId];
    }
    // Admin functions
    function setNewBatchRegistry(address _newRegistryAddress) external onlyOwner {
        batchRegistry = IBatchRegistry(_newRegistryAddress);
    }
    
    function setNewShipmentTracker(address _newTrackerAddress) external onlyOwner {
        shipmentTracker = IShipmentTracker(_newTrackerAddress);
    }

    function pauseManager() external onlyOwner {
        _pause();
    }

    function unpauseManager() external onlyOwner {
        _unpause();
    }
}