// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBatchRegistry
 * @dev Interface for BatchRegistry contract
 */
interface IBatchRegistry {
    enum BatchState { Available, Purchased, Shipped, Delivered, Transferred }
    
    struct Batch {
        uint256 parentId; // 0 if original batch
        address creator;
        string location;
        uint256 quantity;
        uint256 available;
        bool isForSale;
        uint256 price;
        uint256 originId; // Original source batch
        BatchState state;
        address pendingOwner; // For transfers after delivery confirmation
        uint256 createdAt;
        uint256 lastUpdatedAt;
    }
    
    // Events
    event BatchCreated(uint256 indexed id, uint256 parentId, address indexed owner, uint256 quantity, uint256 timestamp);
    event BatchListed(uint256 indexed id, uint256 price, uint256 timestamp);
    event BatchTransferred(uint256 indexed batchId, address indexed from, address indexed to, uint256 timestamp);
    event BatchTransformed(uint256 indexed sourceBatchId, uint256 indexed newBatchId, string transformationDetails, uint256 timestamp);
    event BatchStateUpdated(uint256 indexed batchId, BatchState oldState, BatchState newState, uint256 timestamp);
    event BatchLocationUpdated(uint256 indexed batchId, string oldLocation, string newLocation, uint256 timestamp);
    
    // Functions
    function createBatch(bool _isForSale, uint256 _price, string memory _location, uint256 _quantity) external returns (uint256);
    function transformBatch(uint256 _sourceBatchId, uint256 _newQuantity, string memory _newLocation, string memory _transformationDetails) external returns (uint256);
    function toggleSale(uint256 _batchId, bool _isForSale, uint256 _price) external;
    function transferBatchOwnership(uint256 _batchId, address _newOwner) external;
    function getUserBatches(address _user) external view returns (uint256[] memory);
    function updateBatchState(uint256 _batchId, BatchState _newState) external;
    function updateBatchLocation(uint256 _batchId, string memory _newLocation) external;
    function setPendingOwner(uint256 _batchId, address _pendingOwner) external;
    function getBatch(uint256 _batchId) external view returns (Batch memory);
    function transformBatchForPurchase(uint256 _sourceBatchId,uint256 _newQuantity,address _buyer, string memory _transformationDetails) external returns (uint256);
    function setTransactionManager(address _txManager) external;
    function setShipmentTracker(address _tracker) external;
    
    // Admin functions
    function pauseRegistry() external;
    function unpauseRegistry() external;
    
}