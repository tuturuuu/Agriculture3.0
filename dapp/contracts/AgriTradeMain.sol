// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


import "./BatchRegistry.sol";
import "./ShipmentTracker.sol";
import "./TransactionManager.sol";
import "./interfaces/IBatchRegistry.sol";
import "./interfaces/IShipmentTracker.sol";
import "./interfaces/ITransactionManager.sol";

contract AgriTradeMain is Ownable {
    IBatchRegistry public batchRegistry;
    IShipmentTracker public shipmentTracker;
    ITransactionManager public transactionManager;
    
    constructor() Ownable(msg.sender) {
        // Deploy core contracts
        batchRegistry = new BatchRegistry();
        shipmentTracker = new ShipmentTracker(address(batchRegistry));
        transactionManager = new TransactionManager(address(batchRegistry), address(shipmentTracker));
        batchRegistry.setTransactionManager(address(transactionManager));
        batchRegistry.setShipmentTracker(address(shipmentTracker));
        shipmentTracker.setTransactionManager(address(transactionManager));
        
        // Set ownership of core contracts to this contract
        // This allows the main contract to manage the system
    }
    
    // Functions to upgrade components if needed
    function upgradeBatchRegistry(address _newRegistry) external onlyOwner {
        batchRegistry = BatchRegistry(_newRegistry);
        shipmentTracker.setNewBatchRegistry(_newRegistry);
        transactionManager.setNewBatchRegistry(_newRegistry);
    }
    
    function upgradeShipmentTracker(address _newTracker) external onlyOwner {
        shipmentTracker = ShipmentTracker(_newTracker);
        transactionManager.setNewShipmentTracker(_newTracker);
    }
    
    function upgradeTransactionManager(address _newManager) external onlyOwner {
        transactionManager = TransactionManager(_newManager);
    }
}