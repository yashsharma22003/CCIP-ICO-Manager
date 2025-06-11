const { ethers } = require("hardhat");

    async function main() {
      const [deployer] = await ethers.getSigners();
      console.log(`[INFO] Deploying BurnMintERC20 with account: ${deployer.address}`);
      console.log(`[INFO] Account balance: ${(await ethers.provider.getBalance(deployer.address)).toString()}`);
      
      // --- Deploy Contract ---
      console.log('[INFO] Deploying BurnMintERC20 contract...');
      const ContractFactory = await ethers.getContractFactory('BurnMintERC20');
      // NOTE: Assuming the token constructor requires no arguments. 
      // If it does, they must be passed from the server.
      const token = await ContractFactory.deploy();

      console.log('[INFO] Waiting for deployment to be confirmed...');
      await token.waitForDeployment();
      const tokenAddress = await token.getAddress();

      // THIS IS THE CRITICAL OUTPUT LINE THE SERVER PARSES
      console.log(`Token deployed to: ${tokenAddress}`);

      // --- Optional: Verification Step ---
      const network = await ethers.provider.getNetwork();
      const networkName = network.name;
      
      // It will only run if VERIFY_CONTRACT is "true" and it's not a local network.
      if (process.env.VERIFY_CONTRACT === "true" && networkName !== 'hardhat' && networkName !== 'localhost') {
        console.log(`[INFO] Starting contract verification on ${networkName} (may take a moment)...`);
        // Wait for 5 blocks to be mined for Etherscan to index the transaction
        await token.deploymentTransaction().wait(5); 

        try {
          await hre.run("verify:verify", {
            address: tokenAddress,
            constructorArguments: [], // Add constructor arguments here if any
          });
          console.log("[SUCCESS] Contract verified successfully on Etherscan.");
        } catch (verifyError) {
          console.error("[ERROR] Contract verification failed:", verifyError.message);
        }
      }
    }

    // --- Main execution block ---
    main()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('[FATAL] Token deployment script failed:', error);
        process.exit(1);
      });