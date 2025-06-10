// scripts/deployToken.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);
  
  // 1. Deploy contract
  const contract = await ethers.getContractFactory('BurnMintERC20');
  const token = await contract.deploy("MyToken", "MTK", 18, 0, 0);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  
  console.log(`Token deployed to: ${tokenAddress}`);
  console.log(`Deployer address: ${deployer.address}`);

  // 2. Verification (skip for local networks)
  if (process.env.VERIFY_CONTRACT === "true") {
    console.log("Verifying contract...");
    
    // Wait for block confirmations
    await token.deploymentTransaction().wait(5);
    
    try {
      // Run verification task
      await hre.run("verify:verify", {
        address: tokenAddress,
        constructorArguments: ["MyToken", "MTK", 18, 0, 0],
      });
      console.log("Contract verified successfully");
      return tokenAddress;
    } catch (error) {
      console.error("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });