// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IBatchRegistry.sol";
import "./IShipmentTracker.sol";

interface ITransactionManager {
    enum Status { NotShipped, InTransit, Delivered, Confirmed, Disputed }
    
    struct Transaction {
        uint256 batchId;
        address buyer;
        address seller;
        uint256 price;
        uint256 quantity;
        Status status;
        uint256 disputeTimeoutTimestamp;
    }

    // Functions for purchasing, confirming, and disputing transactions
    function buyBatch(uint256 _batchId, uint256 _quantity) external payable;
    function confirmPurchase(uint256 _txId) external;
    function disputePurchase(uint256 _txId) external;
    function autoReleaseEscrow(uint256 _txId) external;
    function updateTransactionStatus(uint256 _txId, Status _newStatus) external;
    
    // Functions for transaction retrieval
    function getUserTransactions(address _user) external view returns (uint256[] memory);
    
    // Add this to ITransactionManager.sol
    function getBatchTransaction(uint256 _batchId) external view returns (uint256);

    // Admin functions
    function setDisputePeriod(uint256 _newPeriod) external;
    function setNewBatchRegistry(address _newRegistryAddress) external;
    function setNewShipmentTracker(address _newTrackerAddress) external;
    function pauseManager() external;
    function unpauseManager() external;

    // Events
    event BatchPurchased(uint256 indexed batchId, uint256 indexed txId, address indexed buyer);
    event PurchaseConfirmed(uint256 indexed txId, address indexed buyer, address indexed seller, uint256 amount);
    event PurchaseDisputed(uint256 indexed txId, address indexed buyer);
    event TransactionStateChanged(uint256 indexed txId, Status newStatus);
    event DisputePeriodChanged(uint256 oldPeriod, uint256 newPeriod);
}
