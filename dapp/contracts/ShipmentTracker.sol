// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IBatchRegistry.sol"; 
import "./interfaces/IShipmentTracker.sol";
import "./interfaces/ITransactionManager.sol";

contract ShipmentTracker is Pausable, Ownable, ReentrancyGuard, IShipmentTracker {
    
    mapping(uint256 => Shipment[]) public shipments;
    ITransactionManager public transactionManager;

    IBatchRegistry public batchRegistry;
    
    constructor(address _batchRegistryAddress) Ownable(msg.sender) {
        batchRegistry = IBatchRegistry(_batchRegistryAddress);
    }
    
    function addShipment(
        uint256 _batchId, 
        string memory _from, 
        string memory _to, 
        string memory _details
    ) external whenNotPaused nonReentrant {
        // Check ownership through batch registry
        IBatchRegistry.Batch memory batch = batchRegistry.getBatch(_batchId);
        require(batch.creator == msg.sender || address(batchRegistry) == msg.sender, "Not authorized");
        
        uint256 legIndex = shipments[_batchId].length;
        string memory fromLocation;
        
        if (legIndex == 0) {
            require(bytes(_from).length > 0, "From location required for first leg");
            fromLocation = _from;
            
            // Update batch state to shipped if this is first leg
            batchRegistry.updateBatchState(_batchId, IBatchRegistry.BatchState.Shipped);
        } else {
            Shipment storage lastLeg = shipments[_batchId][legIndex - 1];
            require(lastLeg.status == Status.InTransit || lastLeg.status == Status.Delivered, "Previous leg not in transit");
            fromLocation = lastLeg.to;
        }
        
        shipments[_batchId].push(Shipment({
            batchId: _batchId,
            shipper: msg.sender,
            from: fromLocation,
            to: _to,
            timestamp: block.timestamp,
            status: Status.InTransit,
            legIndex: legIndex,
            details: _details
        }));
        
        // Update batch location
        batchRegistry.updateBatchLocation(_batchId, _to);

        uint256 txId = transactionManager.getBatchTransaction(_batchId);

        if (txId > 0) {
            transactionManager.updateTransactionStatus(txId, ITransactionManager.Status.InTransit);
        }
        
        emit ShipmentLeg(_batchId, legIndex, fromLocation, _to, _details);
    }
    
    function completeLeg(uint256 _batchId, uint256 _legIndex) external nonReentrant {
        require(_legIndex < shipments[_batchId].length, "Invalid leg");
        Shipment storage leg = shipments[_batchId][_legIndex];
        
        require(leg.shipper == msg.sender, "Not shipper");
        require(leg.status == Status.InTransit, "Not in transit");
        
        leg.status = Status.Delivered;
        
        // If this is the last leg, update batch state
        if (_legIndex == shipments[_batchId].length - 1) {
            uint256 txId = transactionManager.getBatchTransaction(_batchId);
            if (txId > 0) {
                transactionManager.updateTransactionStatus(txId, ITransactionManager.Status.Delivered);
                batchRegistry.updateBatchState(_batchId, IBatchRegistry.BatchState.Delivered);
            }
        }
        emit ShipmentStatusChanged(_batchId, _legIndex, Status.InTransit, Status.Delivered);
    }
    
    function getBatchJourney(uint256 _batchId) external view returns (Shipment[] memory) {
        // If invalid batch ID is provided, return empty array immediately
        if (_batchId == 0) {
            return new Shipment[](0);
        }
        
        // First pass: Count total shipments and batch levels
        uint256 journeyLength = 0;
        uint256 batchCount = 0;
        uint256 currentBatchId = _batchId;
        
        while (currentBatchId != 0) {
            journeyLength += shipments[currentBatchId].length;
            batchCount++;
            currentBatchId = batchRegistry.getBatch(currentBatchId).parentId;
        }
        
        // Return empty array if no shipments found
        if (journeyLength == 0) {
            return new Shipment[](0);
        }
        
        // Create right-sized arrays
        uint256[] memory batchIds = new uint256[](batchCount);
        Shipment[] memory fullJourney = new Shipment[](journeyLength);
        
        // Second pass: Store batch IDs in reverse order
        currentBatchId = _batchId;
        for (uint256 i = 0; i < batchCount; i++) {
            batchIds[i] = currentBatchId;
            currentBatchId = batchRegistry.getBatch(currentBatchId).parentId;
        }
        
        // Third pass: Fill journey array in reverse chronological order
        uint256 position = 0;
        for (uint256 i = 0; i < batchCount; i++) {
            Shipment[] storage currentShipments = shipments[batchIds[i]];
            uint256 shipmentCount = currentShipments.length;
            
            for (uint256 j = 0; j < shipmentCount; j++) {
                fullJourney[position++] = currentShipments[j];
            }
        }
        
        return fullJourney;
    }
    
    // Admin functions
    function setNewBatchRegistry(address _newRegistryAddress) external onlyOwner {
        batchRegistry = IBatchRegistry(_newRegistryAddress);
    }

    function setTransactionManager(address _transactionManagerAddress) external onlyOwner {
        transactionManager = ITransactionManager(_transactionManagerAddress);
    }

    function pauseTracker() external onlyOwner {
        _pause();
    }

    function unpauseTracker() external onlyOwner {
        _unpause();
    }
}