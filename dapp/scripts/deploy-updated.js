const hre = require("hardhat");
const { faker } = require("@faker-js/faker");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    // const BatchRegistry = await hre.ethers.getContractFactory("BatchRegistry");
    // const batchRegistry = await BatchRegistry.deploy();
    // await batchRegistry.waitForDeployment();
    // console.log(`BatchRegistry deployed at: ${batchRegistry.target}`);
    // const address = await batchRegistry.getAddress();

    // const ShipmentTracker = await hre.ethers.getContractFactory("ShipmentTracker");
    // const shipmentTracker = await ShipmentTracker.deploy(address);
    // await shipmentTracker.waitForDeployment();
    // console.log(`ShipmentTracker deployed at: ${shipmentTracker.target}`);
    // const address2 = await batchRegistry.getAddress();

    // const TransactionManager = await hre.ethers.getContractFactory("TransactionManager");
    // const transactionManager = await TransactionManager.deploy(address, address2);
    // await transactionManager.waitForDeployment();
    // console.log(`TransactionManager deployed at: ${transactionManager.target}`);
    // const address3 = await transactionManager.getAddress();

    const AgriTradeMain = await hre.ethers.getContractFactory("AgriTradeMain");
    const agriTradeMain = await AgriTradeMain.deploy();
    await agriTradeMain.waitForDeployment();
    console.log(`AgriTradeMain deployed at: ${agriTradeMain.target}`);
    const address4 = await agriTradeMain.getAddress();
}
    
// Execute script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});