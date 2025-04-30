const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgriTradeMain Contract", function () {
  let AgriTradeMain;
  let agriTradeMain;
  let batchRegistry;
  let shipmentTracker;
  let transactionManager;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Deploy the main contract
    AgriTradeMain = await ethers.getContractFactory("AgriTradeMain");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    agriTradeMain = await AgriTradeMain.deploy();

    // Get addresses of the core contracts
    const batchRegistryAddress = await agriTradeMain.batchRegistry();
    const shipmentTrackerAddress = await agriTradeMain.shipmentTracker();
    const transactionManagerAddress = await agriTradeMain.transactionManager();

    // Get contract instances
    const BatchRegistry = await ethers.getContractFactory("BatchRegistry");
    const ShipmentTracker = await ethers.getContractFactory("ShipmentTracker");
    const TransactionManager = await ethers.getContractFactory("TransactionManager");

    batchRegistry = BatchRegistry.attach(batchRegistryAddress);
    shipmentTracker = ShipmentTracker.attach(shipmentTrackerAddress);
    transactionManager = TransactionManager.attach(transactionManagerAddress);
  });

  describe("Batch Creation and Management", function () {
    it("Should create a new batch", async function () {
      // Create a batch through the BatchRegistry
      await batchRegistry.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      
      // Get batch details
      const batch = await batchRegistry.getBatch(1);
      
      expect(batch.creator).to.equal(addr1.address);
      expect(batch.quantity).to.equal(100);
      expect(batch.available).to.equal(100);
      expect(batch.isForSale).to.equal(true);
      expect(batch.price).to.equal(ethers.parseEther("1.0"));
      expect(batch.location).to.equal("Farm A");
      expect(batch.state).to.equal(0); // BatchState.Available
    });

    it("Should toggle batch sale status", async function () {
      // Create a batch
      await batchRegistry.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      
      // Toggle sale off
      await batchRegistry.connect(addr1).toggleSale(1, false, 0);
      let batch = await batchRegistry.getBatch(1);
      expect(batch.isForSale).to.equal(false);
      
      // Toggle sale on with new price
      await batchRegistry.connect(addr1).toggleSale(1, true, ethers.parseEther("2.0"));
      batch = await batchRegistry.getBatch(1);
      expect(batch.isForSale).to.equal(true);
      expect(batch.price).to.equal(ethers.parseEther("2.0"));
    });

    it("Should update batch location", async function () {
      // Create a batch
      await batchRegistry.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      
      // Update location
      await batchRegistry.connect(addr1).updateBatchLocation(1, "Storage Facility");
      
      const batch = await batchRegistry.getBatch(1);
      expect(batch.location).to.equal("Storage Facility");
    });

    it("Should transform a batch", async function () {
      // Create a batch
      await batchRegistry.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      
      // Transform batch
      await batchRegistry.connect(addr1).transformBatch(1, 50, "Processing Plant", "Processed into refined product");
      
      // Check original batch quantity reduced
      const originalBatch = await batchRegistry.getBatch(1);
      expect(originalBatch.available).to.equal(50);
      
      // Check new transformed batch
      const newBatch = await batchRegistry.getBatch(2);
      expect(newBatch.parentId).to.equal(1);
      expect(newBatch.quantity).to.equal(50);
      expect(newBatch.location).to.equal("Processing Plant");
      expect(newBatch.creator).to.equal(addr1.address);
    });

    it("Should fail if non-owner tries to update batch", async function () {
      // Create a batch
      await batchRegistry.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      
      // Try to update with non-owner
      await expect(
        batchRegistry.connect(addr2).updateBatchLocation(1, "Storage Facility")
      ).to.be.revertedWith("Not authorized");
      
      await expect(
        batchRegistry.connect(addr2).toggleSale(1, false, 0)
      ).to.be.revertedWith("Not batch owner");
    });
  });

  describe("Batch Purchase and Transaction Management", function () {
    beforeEach(async function () {
      // Create a batch for sale
      await batchRegistry.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
    });

    it("Should purchase a batch", async function () {
      // Purchase quantity of 50 from batch
      const price = ethers.parseEther("50.0"); // 50 units * 1 ETH/unit
      await transactionManager.connect(addr2).buyBatch(1, 50, { value: price });
      
      // Check original batch has reduced quantity
      const originalBatch = await batchRegistry.getBatch(1);
      expect(originalBatch.available).to.equal(50);
      
      // Check the transaction details
      const userTxIds = await transactionManager.getUserTransactions(addr2.address);
      const txId = userTxIds[0];
      const tx = await transactionManager.transactions(txId);
      
      expect(tx.buyer).to.equal(addr2.address);
      expect(tx.seller).to.equal(addr1.address);
      expect(tx.quantity).to.equal(50);
      expect(tx.price).to.equal(price);
      expect(tx.status).to.equal(0); // Status.NotShipped
      
      // Check new batch created for the buyer (with pendingOwner)
      const newBatchId = tx.batchId;
      const newBatch = await batchRegistry.getBatch(newBatchId);
      expect(newBatch.quantity).to.equal(50);
      expect(newBatch.creator).to.equal(addr1.address); // Still creator until delivery confirmed
      expect(newBatch.pendingOwner).to.equal(addr2.address);
      expect(newBatch.state).to.equal(1); // BatchState.Purchased
    });

    it("Should fail purchase if insufficient funds", async function () {
      const price = ethers.parseEther("49.0"); // Less than required (50 * 1 ETH)
      await expect(
        transactionManager.connect(addr2).buyBatch(1, 50, { value: price })
      ).to.be.revertedWith("Insufficient funds");
    });

    it("Should fail purchase if batch not for sale", async function () {
      // Toggle sale off
      await batchRegistry.connect(addr1).toggleSale(1, false, 0);
      
      const price = ethers.parseEther("50.0");
      await expect(
        transactionManager.connect(addr2).buyBatch(1, 50, { value: price })
      ).to.be.revertedWith("Not for sale");
    });

    it("Should fail purchase if insufficient quantity", async function () {
      const price = ethers.parseEther("150.0");
      await expect(
        transactionManager.connect(addr2).buyBatch(1, 150, { value: price })
      ).to.be.revertedWith("Not enough available");
    });
  });

  describe("Shipment Tracking", function () {
    beforeEach(async function () {
      // Create a batch and purchase it
      await batchRegistry.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      await transactionManager.connect(addr2).buyBatch(1, 100, { value: ethers.parseEther("100.0") });
      
      // Get transaction ID
      const userTxIds = await transactionManager.getUserTransactions(addr2.address);
      this.txId = userTxIds[0];
      
      // Get the purchased batch ID
      const tx = await transactionManager.transactions(this.txId);
      this.batchId = tx.batchId;
    });

    it("Should add a shipment leg", async function () {
      // Add shipment
      await shipmentTracker.connect(addr1).addShipment(
        this.batchId,
        "Farm A",
        "Warehouse 1",
        "Initial shipment"
      );
      
      // Check batch state updated
      const batch = await batchRegistry.getBatch(this.batchId);
      expect(batch.state).to.equal(2); // BatchState.Shipped
      
      // Check shipment details
      const journey = await shipmentTracker.getBatchJourney(this.batchId);
      expect(journey.length).to.equal(1);
      expect(journey[0].from).to.equal("Farm A");
      expect(journey[0].to).to.equal("Warehouse 1");
      expect(journey[0].status).to.equal(1); // Status.InTransit
      expect(journey[0].details).to.equal("Initial shipment");
      expect(journey[0].shipper).to.equal(addr1.address);
      expect(journey[0].legIndex).to.equal(0);
      
      // Check transaction status updated
      const tx = await transactionManager.transactions(this.txId);
      expect(tx.status).to.equal(1); // Status.InTransit
    });

    it("Should complete a shipment leg", async function () {
      // Add shipment
      await shipmentTracker.connect(addr1).addShipment(
        this.batchId,
        "Farm A",
        "Warehouse 1",
        "Initial shipment"
      );
      
      // Complete leg
      await shipmentTracker.connect(addr1).completeLeg(this.batchId, 0);
      
      // Check shipment status
      const journey = await shipmentTracker.getBatchJourney(this.batchId);
      expect(journey[0].status).to.equal(2); // Status.Delivered
      
      // Check batch state
      const batch = await batchRegistry.getBatch(this.batchId);
      expect(batch.state).to.equal(3); // BatchState.Delivered
      
      // Check transaction status
      const tx = await transactionManager.transactions(this.txId);
      expect(tx.status).to.equal(2); // Status.Delivered
    });

    it("Should fail if non-owner tries to add shipment", async function () {
      await expect(
        shipmentTracker.connect(addr2).addShipment(
          this.batchId,
          "Farm A",
          "Warehouse 1",
          "Initial shipment"
        )
      ).to.be.revertedWith("Not authorized");
    });

    it("Should fail if non-shipper tries to complete leg", async function () {
      // Add shipment
      await shipmentTracker.connect(addr1).addShipment(
        this.batchId,
        "Farm A",
        "Warehouse 1",
        "Initial shipment"
      );
      
      // Try to complete with different account
      await expect(
        shipmentTracker.connect(addr2).completeLeg(this.batchId, 0)
      ).to.be.revertedWith("Not shipper");
    });
  });

  describe("Purchase Confirmation and Dispute", function () {
    beforeEach(async function () {
      // Create a batch
      await batchRegistry.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      
      // Purchase batch
      await transactionManager.connect(addr2).buyBatch(1, 100, { value: ethers.parseEther("100.0") });
      
      // Get transaction ID
      const userTxIds = await transactionManager.getUserTransactions(addr2.address);
      this.txId = userTxIds[0];
      
      // Get purchased batch ID
      const tx = await transactionManager.transactions(this.txId);
      this.batchId = tx.batchId;
      
      // Add shipment and complete
      await shipmentTracker.connect(addr1).addShipment(
        this.batchId,
        "Farm A",
        "Warehouse 1",
        "Initial shipment"
      );
      await shipmentTracker.connect(addr1).completeLeg(this.batchId, 0);
    });

    it("Should confirm purchase and transfer ownership", async function () {
      // Get seller balance before
      const sellerBalanceBefore = await ethers.provider.getBalance(addr1.address);
      
      // Buyer confirms purchase
      await transactionManager.connect(addr2).confirmPurchase(this.txId);
      
      // Check transaction status
      const tx = await transactionManager.transactions(this.txId);
      expect(tx.status).to.equal(3); // Status.Confirmed
      
      // Check batch ownership is transferred
      const batch = await batchRegistry.getBatch(this.batchId);
      expect(batch.creator).to.equal(addr2.address);  // Now owned by buyer
      expect(batch.state).to.equal(0); // BatchState.Available
      expect(batch.pendingOwner).to.equal(ethers.ZeroAddress);
      
      // Check seller received payment
      const sellerBalanceAfter = await ethers.provider.getBalance(addr1.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(ethers.parseEther("100.0"));
    });

    it("Should allow buyer to dispute purchase", async function () {
      // Buyer disputes purchase
      await transactionManager.connect(addr2).disputePurchase(this.txId);
      
      // Check transaction status
      const tx = await transactionManager.transactions(this.txId);
      expect(tx.status).to.equal(4); // Status.Disputed
    });

    it("Should fail if non-buyer confirms purchase", async function () {
      await expect(
        transactionManager.connect(addr1).confirmPurchase(this.txId)
      ).to.be.revertedWith("Not buyer");
    });

    it("Should fail if non-buyer disputes purchase", async function () {
      await expect(
        transactionManager.connect(addr1).disputePurchase(this.txId)
      ).to.be.revertedWith("Not buyer");
    });

    it("Should auto-release escrow after dispute period", async function () {
      // Get seller balance before
      const sellerBalanceBefore = await ethers.provider.getBalance(addr1.address);
      
      // Fast forward time to after dispute period (default 7 days)
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
      await ethers.provider.send("evm_mine");
      
      // Release escrow
      await transactionManager.connect(addr1).autoReleaseEscrow(this.txId);
      
      // Check transaction status
      const tx = await transactionManager.transactions(this.txId);
      expect(tx.status).to.equal(3); // Status.Confirmed
      
      // Check batch ownership is transferred
      const batch = await batchRegistry.getBatch(this.batchId);
      expect(batch.creator).to.equal(addr2.address);  // Now owned by buyer
      
      // Check seller received payment
      const sellerBalanceAfter = await ethers.provider.getBalance(addr1.address);
      // Account for gas costs, so check if the difference is approximately 100 ETH
      const difference = sellerBalanceAfter - sellerBalanceBefore;
      expect(difference).to.be.closeTo(
        ethers.parseEther("100.0"),
        ethers.parseEther("0.1") // Allow for gas costs
      );
    });

    it("Should fail auto-release before dispute period", async function () {
      // Try to release escrow before dispute period ends
      await expect(
        transactionManager.connect(addr1).autoReleaseEscrow(this.txId)
      ).to.be.revertedWith("Dispute period active");
    });
  });

  describe("Batch Transfer and Chain of Custody", function () {
    beforeEach(async function () {
      // Create a batch
      await batchRegistry.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
    });

    it("Should transfer batch ownership", async function () {
      // Transfer batch
      await batchRegistry.connect(addr1).transferBatchOwnership(1, addr2.address);
      
      // Check new owner
      const batch = await batchRegistry.getBatch(1);
      expect(batch.creator).to.equal(addr2.address);
    });

    it("Should track full batch lifecycle", async function () {
      // List batch for sale
      await batchRegistry.connect(addr1).toggleSale(1, true, ethers.parseEther("2.0"));
      
      // Buy a portion
      await transactionManager.connect(addr2).buyBatch(1, 50, { value: ethers.parseEther("100.0") });
      
      // Get transaction ID and batch ID
      const userTxIds = await transactionManager.getUserTransactions(addr2.address);
      const txId = userTxIds[0];
      const tx = await transactionManager.transactions(txId);
      const purchasedBatchId = tx.batchId;
      
      // Start shipment
      await shipmentTracker.connect(addr1).addShipment(
        purchasedBatchId,
        "Farm A",
        "Warehouse 1",
        "Initial shipment"
      );
      
      // Transport to another location
      await shipmentTracker.connect(addr1).completeLeg(purchasedBatchId, 0);
      await shipmentTracker.connect(addr1).addShipment(
        purchasedBatchId,
        "Warehouse 1",
        "Processing Plant",
        "Further processing"
      );
      await shipmentTracker.connect(addr1).completeLeg(purchasedBatchId, 1);
      
      // Confirm purchase
      await transactionManager.connect(addr2).confirmPurchase(txId);
      
      // New owner transforms batch
      await batchRegistry.connect(addr2).transformBatch(
        purchasedBatchId,
        25,
        "Retail Store",
        "Processed for retail"
      );
      
      // Check transformation created a new batch
      const transformedBatchId = BigInt(purchasedBatchId) + 1n;
      const transformedBatch = await batchRegistry.getBatch(transformedBatchId);
      expect(transformedBatch.parentId).to.equal(purchasedBatchId);
      expect(transformedBatch.quantity).to.equal(25);
      expect(transformedBatch.creator).to.equal(addr2.address);
      
      // Check original batch has reduced quantity
      const originalBatch = await batchRegistry.getBatch(purchasedBatchId);
      expect(originalBatch.available).to.equal(25);
      
      // Check journey can be traced
      const journey = await shipmentTracker.getBatchJourney(transformedBatchId);
      expect(journey.length).to.be.at.least(1);
      expect(journey[0].from).to.equal("Processing Plant");
      expect(journey[0].to).to.equal("Retail Store");
    });
  });
});