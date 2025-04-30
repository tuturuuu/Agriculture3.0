// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IBatchRegistry.sol";

interface IShipmentTracker {
    enum Status { NotShipped, InTransit, Delivered, Confirmed, Disputed }
    
    struct Shipment {
        uint256 batchId;
        address shipper;
        string from;
        string to;
        uint256 timestamp;
        Status status;
        uint256 legIndex;
        string details;
    }

    // Function to add a shipment leg to a batch
    function addShipment(
        uint256 _batchId, 
        string memory _from, 
        string memory _to, 
        string memory _details
    ) external;

    // Function to complete a shipment leg and update the status
    function completeLeg(uint256 _batchId, uint256 _legIndex) external;

    // Function to get the journey (all shipment legs) of a batch
    function getBatchJourney(uint256 _batchId) external view returns (Shipment[] memory);
    
    function setTransactionManager(address _transactionManagerAddress) external;

    // Admin functions
    function setNewBatchRegistry(address _newRegistryAddress) external;
    function pauseTracker() external;
    function unpauseTracker() external;

    // Events
    event ShipmentLeg(uint256 indexed batchId, uint256 legIndex, string from, string to, string details);
    event ShipmentStatusChanged(uint256 indexed batchId, uint256 legIndex, Status oldStatus, Status newStatus);
}
