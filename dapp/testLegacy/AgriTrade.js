const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgriTrade Contract", function () {
  let AgriTrade;
  let agriTrade;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Deploy the contract
    AgriTrade = await ethers.getContractFactory("AgriTrade");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    agriTrade = await AgriTrade.deploy();
  });

  describe("Batch Creation", function () {
    it("Should create a new batch", async function () {
      await agriTrade.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      const batch = await agriTrade.batches(1);
      expect(batch.creator).to.equal(addr1.address);
      expect(batch.quantity).to.equal(100);
      expect(batch.isForSale).to.equal(true);
    });

    it("Should fail if quantity is zero", async function () {
      await expect(
        agriTrade.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 0)
      ).to.be.revertedWith("Invalid quantity");
    });
  });

  describe("Batch Purchase", function () {
    beforeEach(async function () {
      // Create a batch for sale
      await agriTrade.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
    });

    it("Should allow a user to purchase a batch", async function () {
      const price = ethers.parseEther("50.0"); // 50 units * 1 ETH/unit
      await agriTrade.connect(addr2).buyBatch(1, 50, { value: price });

      // Check original batch has reduced quantity
      const originalBatch = await agriTrade.batches(1);
      expect(originalBatch.available).to.equal(50); // 100 - 50 = 50 remaining

      // A new batch is created for the purchased portion when partial purchase
      const newBatch = await agriTrade.batches(2);
      expect(newBatch.quantity).to.equal(50);
      expect(newBatch.creator).to.equal(addr1.address); // Still owned by seller until delivery
      expect(newBatch.pendingOwner).to.equal(addr2.address); // Buyer is pending owner
      expect(newBatch.state).to.equal(1); // BatchState.Purchased

      // Fetch the transaction details
      const tx = await agriTrade.transactions(1);
      expect(tx.buyer).to.equal(addr2.address);
      expect(tx.seller).to.equal(addr1.address);
      expect(tx.quantity).to.equal(50);
      expect(tx.batchId).to.equal(2); // Transaction references the new batch
    });

    it("Should fail if insufficient funds are sent", async function () {
      const price = ethers.parseEther("49.0"); // Less than required (50 * 1 ETH)
      await expect(
        agriTrade.connect(addr2).buyBatch(1, 50, { value: price })
      ).to.be.revertedWith("Insufficient funds");
    });

    it("Should fail if batch is not for sale", async function () {
      await agriTrade.connect(addr1).toggleSale(1, false, 0);
      await expect(
        agriTrade.connect(addr2).buyBatch(1, 50, { value: ethers.parseEther("50.0") })
      ).to.be.revertedWith("Not for sale");
    });
  });

  describe("Shipment Management", function () {
    beforeEach(async function () {
      // Create a batch and purchase it
      await agriTrade.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      await agriTrade.connect(addr2).buyBatch(1, 100, { value: ethers.parseEther("100.0") });
    });

    it("Should allow adding a shipment leg", async function () {
      await agriTrade.connect(addr1).addShipment(1, "Farm A", "Warehouse 1", "Initial shipment");
      const shipment = await agriTrade.shipments(1, 0);
      expect(shipment.from).to.equal("Farm A");
      expect(shipment.to).to.equal("Warehouse 1");
      expect(shipment.status).to.equal(1); // Status.InTransit
      
      // Check if batch state is updated
      const batch = await agriTrade.batches(1);
      expect(batch.state).to.equal(2); // BatchState.Shipped
      
      // Check if transaction status is updated
      const tx = await agriTrade.transactions(1);
      expect(tx.status).to.equal(1); // Status.InTransit
    });

    it("Should fail if not authorized to add shipment", async function () {
      await expect(
        agriTrade.connect(addr2).addShipment(1, "Farm A", "Warehouse 1", "Initial shipment")
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Purchase Confirmation", function () {
    beforeEach(async function () {
      // Create a batch, purchase it, and mark as delivered
      await agriTrade.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      await agriTrade.connect(addr2).buyBatch(1, 100, { value: ethers.parseEther("100.0") });
      await agriTrade.connect(addr1).addShipment(1, "Farm A", "Warehouse 1", "Initial shipment");
      await agriTrade.connect(addr1).completeLeg(1, 0, 1); // Note: we need to specify the txId
    });

    it("Should allow buyer to confirm purchase", async function () {
      // Get balance before confirmation
      const sellerBalanceBefore = await ethers.provider.getBalance(addr1.address);
      
      await agriTrade.connect(addr2).confirmPurchase(1);
      
      // Check transaction status
      const tx = await agriTrade.transactions(1);
      expect(tx.status).to.equal(3); // Status.Confirmed

      // Check batch ownership transfer
      const batch = await agriTrade.batches(1);
      expect(batch.creator).to.equal(addr2.address); // Ownership transferred
      expect(batch.state).to.equal(0); // BatchState.Available (reset for new owner)
      
      // Check if payment was transferred to seller
      const sellerBalanceAfter = await ethers.provider.getBalance(addr1.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(ethers.parseEther("100.0"));
    });

    it("Should fail if not buyer confirms", async function () {
      await expect(
        agriTrade.connect(addr1).confirmPurchase(1)
      ).to.be.revertedWith("Not buyer");
    });
  });

  describe("Dispute Handling", function () {
    beforeEach(async function () {
      // Create a batch, purchase it, and mark as delivered
      await agriTrade.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      await agriTrade.connect(addr2).buyBatch(1, 100, { value: ethers.parseEther("100.0") });
      await agriTrade.connect(addr1).addShipment(1, "Farm A", "Warehouse 1", "Initial shipment");
      await agriTrade.connect(addr1).completeLeg(1, 0, 1); // Specify txId
    });

    it("Should allow buyer to dispute purchase", async function () {
      await agriTrade.connect(addr2).disputePurchase(1);
      const tx = await agriTrade.transactions(1);
      expect(tx.status).to.equal(4); // Status.Disputed
    });

    it("Should fail if not buyer disputes", async function () {
      await expect(
        agriTrade.connect(addr1).disputePurchase(1)
      ).to.be.revertedWith("Not buyer");
    });
  });

  describe("Batch Transformation", function () {
    beforeEach(async function () {
      // Create a batch
      await agriTrade.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
    });

    it("Should allow transforming a batch", async function () {
      await agriTrade.connect(addr1).transformBatch(1, 50, "Processing Plant", "Processed into refined product");
      
      // Check original batch has reduced quantity
      const originalBatch = await agriTrade.batches(1);
      expect(originalBatch.available).to.equal(50);
      
      // Check new transformed batch
      const newBatch = await agriTrade.batches(2);
      expect(newBatch.parentId).to.equal(1);
      expect(newBatch.quantity).to.equal(50);
      expect(newBatch.location).to.equal("Processing Plant");
      expect(newBatch.creator).to.equal(addr1.address);
      
      // Check transformation shipment record
      const shipment = await agriTrade.shipments(2, 0);
      expect(shipment.from).to.equal("Farm A");
      expect(shipment.to).to.equal("Processing Plant");
      expect(shipment.details).to.equal("Processed into refined product");
      expect(shipment.status).to.equal(2); // Status.Delivered
    });
  });

  describe("Auto-release Escrow", function () {
    beforeEach(async function () {
      // Create a batch, purchase it, and mark as delivered
      await agriTrade.connect(addr1).createBatch(true, ethers.parseEther("1.0"), "Farm A", 100);
      await agriTrade.connect(addr2).buyBatch(1, 100, { value: ethers.parseEther("100.0") });
      await agriTrade.connect(addr1).addShipment(1, "Farm A", "Warehouse 1", "Initial shipment");
      await agriTrade.connect(addr1).completeLeg(1, 0, 1);
    });

    it("Should auto-release escrow after dispute period", async function () {
      // Get balance before auto-release
      const sellerBalanceBefore = await ethers.provider.getBalance(addr1.address);
      
      // Fast forward time to after dispute period
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
      await ethers.provider.send("evm_mine");
      
      await agriTrade.connect(addr1).autoReleaseEscrow(1);
      
      // Check transaction status
      const tx = await agriTrade.transactions(1);
      expect(tx.status).to.equal(3); // Status.Confirmed
      
      // Check batch ownership transfer
      const batch = await agriTrade.batches(1);
      expect(batch.creator).to.equal(addr2.address);
      
      // Check if payment was transferred to seller
      const sellerBalanceAfter = await ethers.provider.getBalance(addr1.address);
      // Account for gas costs, so check if the difference is approximately 100 ETH
      const difference = sellerBalanceAfter - sellerBalanceBefore;
      expect(difference).to.be.closeTo(
        ethers.parseEther("100.0"),
        ethers.parseEther("0.1") // Allow for gas costs
      );
    });
  });
});