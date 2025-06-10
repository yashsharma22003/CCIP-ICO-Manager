// scripts/deployToken.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);
  
  // 1. Deploy contract
  const contract = await ethers.getContractFactory('BurnMintTokenPool');
  const pool = await contract.deploy("0xe929B9C25Be12B4D5139ED1a21b2b23E4B0d1522", 18, [], "0xba3f6251de62dED61Ff98590cB2fDf6871FbB991", "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59");
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  
  console.log(`Pool deployed to: ${poolAddress}`);
  console.log(`Deployer address: ${deployer.address}`);

  // 2. Verification (skip for local networks)
  if (process.env.VERIFY_CONTRACT === "true") {
    console.log("Verifying contract...");
    
    // Wait for block confirmations
    await pool.deploymentTransaction().wait(5);
    
    try {
      // Run verification task
      await hre.run("verify:verify", {
        address: poolAddress,
        constructorArguments: ["0xe929B9C25Be12B4D5139ED1a21b2b23E4B0d1522", 18, [], "0xba3f6251de62dED61Ff98590cB2fDf6871FbB991", "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59"],
      });
      console.log("Contract verified successfully");
      return poolAddress;
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