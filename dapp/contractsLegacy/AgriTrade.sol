// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgriTrade is Pausable, Ownable {
    uint256 public batchCounter;
    uint256 public txCounter;

    enum Status { NotShipped, InTransit, Delivered, Confirmed, Disputed }
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
    }

    struct Transaction {
        uint256 batchId;
        address buyer;
        address seller;
        uint256 price;
        uint256 quantity;
        Status status;
        uint256 disputeTimeoutTimestamp;
    }

    struct Shipment {
        uint256 batchId;
        address shipper;
        string from;
        string to;
        uint256 timestamp;
        Status status;
        uint256 legIndex;
        string details; // Added for transformation details
    }

    // Configurable parameters
    uint256 public disputePeriod = 7 days;

    mapping(uint256 => Batch) public batches;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => Shipment[]) public shipments;
    mapping(uint256 => uint256[]) public batchShipmentIds;
    mapping(address => uint256[]) public userBatches;
    mapping(address => uint256[]) public userTxs;

    event BatchCreated(uint256 indexed id, uint256 parentId, address indexed owner, uint256 quantity);
    event BatchListed(uint256 indexed id, uint256 price);
    event BatchPurchased(uint256 indexed batchId, uint256 indexed txId, address indexed buyer);
    event BatchTransferred(uint256 indexed batchId, address indexed from, address indexed to);
    event BatchTransformed(uint256 indexed sourceBatchId, uint256 indexed newBatchId, string transformationDetails);
    event ShipmentLeg(uint256 indexed batchId, uint256 legIndex, string from, string to, string details);
    event PurchaseConfirmed(uint256 indexed txId, address indexed buyer, address indexed seller, uint256 amount);
    event PurchaseDisputed(uint256 indexed txId, address indexed buyer);
    event TransactionStateChanged(uint256 indexed txId, Status newStatus);

    constructor() Ownable(msg.sender) {}

    // Batch functions
    function createBatch(bool _isForSale, uint256 _price, string memory _location, uint256 _quantity) external whenNotPaused {
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
            pendingOwner: address(0)
        });

        userBatches[msg.sender].push(batchCounter);
        emit BatchCreated(batchCounter, 0, msg.sender, _quantity);
        
        if (_isForSale) {
            emit BatchListed(batchCounter, _price);
        }
    }

    // New function: Transform batch (Option 3)
    function transformBatch(
        uint256 _sourceBatchId, 
        uint256 _newQuantity, 
        string memory _newLocation, 
        string memory _transformationDetails
    ) external whenNotPaused {
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
            pendingOwner: address(0)
        });
        
        // Reduce available quantity from source batch
        sourceBatch.available -= _newQuantity; 
        
        // Copy shipment history from parent
        if (batchShipmentIds[_sourceBatchId].length > 0) {
            for (uint i = 0; i < batchShipmentIds[_sourceBatchId].length; i++) {
                batchShipmentIds[newBatchId].push(batchShipmentIds[_sourceBatchId][i]);
            }
        }
        
        // Add transformation as a special shipment record
        uint256 legIndex = shipments[newBatchId].length;
        shipments[newBatchId].push(Shipment({
            batchId: newBatchId,
            shipper: msg.sender,
            from: sourceBatch.location,
            to: _newLocation,
            timestamp: block.timestamp,
            status: Status.Delivered, // Already "delivered" as this is a transformation
            legIndex: legIndex,
            details: _transformationDetails
        }));
        
        batchShipmentIds[newBatchId].push(newBatchId * 1000000 + legIndex);
        
        // Add to user batches
        userBatches[msg.sender].push(newBatchId);
        
        emit BatchCreated(newBatchId, _sourceBatchId, msg.sender, _newQuantity);
        emit BatchTransformed(_sourceBatchId, newBatchId, _transformationDetails);
    }

    function toggleSale(uint256 _batchId, bool _isForSale, uint256 _price) external {
        Batch storage batch = batches[_batchId];
        require(batch.creator == msg.sender, "Not owner");
        require(_price > 0 || !_isForSale, "Invalid price");
        require(batch.available > 0 || !_isForSale, "Nothing to sell");
        require(batch.state == BatchState.Available, "Batch not available");
        
        batch.isForSale = _isForSale;
        if (_isForSale) {
            batch.price = _price;
            emit BatchListed(_batchId, _price);
        }
    }

    function buyBatch(uint256 _batchId, uint256 _quantity) external payable whenNotPaused {
        Batch storage batch = batches[_batchId];
        require(batch.isForSale, "Not for sale");
        require(batch.available >= _quantity, "Not enough available");
        require(batch.creator != msg.sender, "Can't buy own batch");
        require(_quantity > 0, "Invalid quantity");
        require(batch.state == BatchState.Available, "Batch not available");
        
        uint256 cost = batch.price * _quantity;
        require(msg.value >= cost, "Insufficient funds");

        // Update batch state and available quantity
        if (_quantity == batch.available) {
            // If entire batch is purchased
            batch.state = BatchState.Purchased;
            batch.isForSale = false;
            batch.pendingOwner = msg.sender;
        } else {
            // If partial batch is purchased, create a new batch for the purchased portion
            batchCounter++;
            uint256 newBatchId = batchCounter;
            
            // Create the new batch that will be shipped
            batches[newBatchId] = Batch({
                parentId: _batchId,
                creator: batch.creator, // Original seller remains creator until delivery
                location: batch.location,
                quantity: _quantity,
                available: _quantity, // All is "available" but will be marked as purchased
                isForSale: false,
                price: batch.price,
                originId: batch.originId,
                state: BatchState.Purchased,
                pendingOwner: msg.sender
            });
            
            // Update original batch available quantity
            batch.available -= _quantity;
            
            // Copy shipment history
            if (batchShipmentIds[_batchId].length > 0) {
                for (uint i = 0; i < batchShipmentIds[_batchId].length; i++) {
                    batchShipmentIds[newBatchId].push(batchShipmentIds[_batchId][i]);
                }
            }
            
            // Use the new batch ID for the transaction
            _batchId = newBatchId;
        }

        // Record transaction
        txCounter++;
        transactions[txCounter] = Transaction({
            batchId: _batchId,
            buyer: msg.sender,
            seller: batches[_batchId].creator,
            price: cost,
            quantity: _quantity,
            status: Status.NotShipped,
            disputeTimeoutTimestamp: 0
        });
        
        // Update user records
        userTxs[msg.sender].push(txCounter);
        userTxs[batches[_batchId].creator].push(txCounter);

        // Emit events
        emit BatchPurchased(_batchId, txCounter, msg.sender);
        
        // Return excess payment if any
        if (msg.value > cost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }
    }

    function addShipment(
        uint256 _batchId, 
        string memory _from, 
        string memory _to, 
        string memory _details
    ) external whenNotPaused {
        Batch storage batch = batches[_batchId];
        require(batch.creator == msg.sender, "Not authorized");
        
        uint256 legIndex = shipments[_batchId].length;
        string memory fromLocation;
        
        if (legIndex == 0) {
            // Starting a new shipment (equivalent to startShipment)
            require(batch.state == BatchState.Purchased || batch.state == BatchState.Available, "Cannot ship");
            require(bytes(_from).length > 0, "From location required for first leg");
            fromLocation = _from;
        } else {
            // Adding a leg to existing shipment (equivalent to addShipmentLeg)
            Shipment storage lastLeg = shipments[_batchId][legIndex - 1];
            require(lastLeg.status == Status.InTransit, "Previous leg not in transit");
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
        
        // Store shipment reference
        batchShipmentIds[_batchId].push(_batchId * 1000000 + legIndex);
        
        // Update batch location
        batch.location = _to;
        
        // Update batch state if this is the first leg
        if (legIndex == 0 && batch.state == BatchState.Purchased) {
            batch.state = BatchState.Shipped;
            
            // Update transaction status if this is a purchased batch
            for (uint i = 1; i <= txCounter; i++) {
                if (transactions[i].batchId == _batchId && transactions[i].status == Status.NotShipped) {
                    transactions[i].status = Status.InTransit;
                    emit TransactionStateChanged(i, Status.InTransit);
                    break;
                }
            }
        }

    emit ShipmentLeg(_batchId, legIndex, fromLocation, _to, _details);
    }

    function completeLeg(uint256 _batchId, uint256 _legIndex, uint256 _specificTxId) external {
        require(_legIndex < shipments[_batchId].length, "Invalid leg");
        Shipment storage leg = shipments[_batchId][_legIndex];
        Batch storage batch = batches[_batchId];
        
        require(leg.shipper == msg.sender, "Not shipper");
        require(leg.status == Status.InTransit, "Not in transit");
        
        leg.status = Status.Delivered;
        
        // If this is the last leg, update transaction and batch state
        if (_legIndex == shipments[_batchId].length - 1) {
            if (batch.state == BatchState.Shipped) {
                batch.state = BatchState.Delivered;
            }
            
            // Only update the specific transaction
            if (_specificTxId > 0) {
                Transaction storage tx = transactions[_specificTxId];
                // Verify this transaction actually belongs to this batch
                require(tx.batchId == _batchId, "Transaction doesn't match batch");
                
                if (tx.status == Status.InTransit) {
                    tx.status = Status.Delivered;
                    tx.disputeTimeoutTimestamp = block.timestamp + disputePeriod;
                    emit TransactionStateChanged(_specificTxId, Status.Delivered);
                }
            }
    }
}

    function confirmPurchase(uint256 _txId) external {
        Transaction storage tx = transactions[_txId];
        Batch storage batch = batches[tx.batchId];
        
        require(tx.buyer == msg.sender, "Not buyer");
        require(tx.status == Status.Delivered, "Not delivered");
        require(batch.state == BatchState.Delivered, "Batch not delivered");
        
        // Update status
        tx.status = Status.Confirmed;
        emit TransactionStateChanged(_txId, Status.Confirmed);
        
        // Transfer batch ownership
        transferBatchOwnership(tx.batchId, tx.buyer);
        
        // Transfer payment to seller
        (bool success, ) = payable(tx.seller).call{value: tx.price}("");
        require(success, "Transfer failed");
        
        emit PurchaseConfirmed(_txId, tx.buyer, tx.seller, tx.price);
    }
    
    function transferBatchOwnership(uint256 _batchId, address _newOwner) internal {
        Batch storage batch = batches[_batchId];
                
        // Add batch to new owner's list
        userBatches[_newOwner].push(_batchId);
        
        // Update batch ownership
        address oldOwner = batch.creator;
        batch.creator = _newOwner;
        batch.state = BatchState.Available; // Reset state for new owner
        batch.pendingOwner = address(0);

        
        emit BatchTransferred(_batchId, oldOwner, _newOwner);
    }
    
    function disputePurchase(uint256 _txId) external {
        Transaction storage tx = transactions[_txId];
        require(tx.buyer == msg.sender, "Not buyer");
        require(tx.status == Status.Delivered, "Not delivered");
        
        tx.status = Status.Disputed;
        emit TransactionStateChanged(_txId, Status.Disputed);
        emit PurchaseDisputed(_txId, msg.sender);
    }
    
    function autoReleaseEscrow(uint256 _txId) external {
        Transaction storage tx = transactions[_txId];
        require(tx.status == Status.Delivered, "Not delivered");
        require(tx.disputeTimeoutTimestamp > 0, "No timeout set");
        require(block.timestamp > tx.disputeTimeoutTimestamp, "Dispute period active");
        
        // Automatically confirm purchase after dispute period expires
        tx.status = Status.Confirmed;
        emit TransactionStateChanged(_txId, Status.Confirmed);
        
        // Transfer batch ownership to buyer
        transferBatchOwnership(tx.batchId, tx.buyer);
        
        // Transfer payment to seller
        (bool success, ) = payable(tx.seller).call{value: tx.price}("");
        require(success, "Transfer failed");
        
        emit PurchaseConfirmed(_txId, tx.buyer, tx.seller, tx.price);
    }

    // Added function for direct transaction status update
    function updateTransactionStatus(uint256 _txId, Status _newStatus) external {
        Transaction storage tx = transactions[_txId];
        require(tx.seller == msg.sender || tx.buyer == msg.sender, "Not authorized");
        require(uint(_newStatus) > uint(tx.status), "Cannot revert status"); // Ensure forward-only progression
        
        tx.status = _newStatus;
        emit TransactionStateChanged(_txId, _newStatus);
    }

    function setDisputePeriod(uint256 _newPeriod) external onlyOwner {
        require(_newPeriod >= 1 days && _newPeriod <= 30 days, "Invalid period");
        disputePeriod = _newPeriod;
    }
    
    function getBatchJourney(uint256 _batchId) external view returns (Shipment[] memory) {
        return shipments[_batchId];
    }
    
    function getUserBatches(address _user) external view returns (uint256[] memory) {
        return userBatches[_user];
    }
    
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTxs[_user];
    }

    // Admin functions
    function pauseContract() external onlyOwner {
        _pause();
    }

    function unpauseContract() external onlyOwner {
        _unpause();
    }
}