const hre = require("hardhat");
const { faker } = require("@faker-js/faker");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    const AgriTrade = await hre.ethers.getContractFactory("AgriTrade");
    const agriTrade = await AgriTrade.deploy();
    await agriTrade.waitForDeployment();
    console.log(`AgriTrade deployed at: ${agriTrade.target}`);


}
    
// Execute script
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});