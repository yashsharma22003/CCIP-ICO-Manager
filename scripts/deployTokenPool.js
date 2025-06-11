 const { ethers } = require("hardhat");

    async function main() {
      console.log('[DEBUG] Starting deployment script...');

      // Get parameters from environment variables
      const { TOKEN: token, DECIMALS: localTokenDecimals, ALLOWLIST, RMN_PROXY: rmnProxy, ROUTER: router } = process.env;

      const allowlist = ALLOWLIST ? JSON.parse(ALLOWLIST) : [];

      console.log('[DEBUG] Extracted parameters:', { token, localTokenDecimals, allowlist, rmnProxy, router });

      // --- Robust Validation ---
      if (!token || !ethers.isAddress(token)) {
        throw new Error(`Invalid or missing token address. Received: ${token}`);
      }
      const parsedDecimals = parseInt(localTokenDecimals, 10);
      if (isNaN(parsedDecimals) || parsedDecimals < 0 || parsedDecimals > 255) {
        throw new Error(`Invalid or missing decimals. Received: ${localTokenDecimals}`);
      }
      if (!Array.isArray(allowlist) || !allowlist.every(addr => ethers.isAddress(addr))) {
        throw new Error(`Invalid allowlist: must be an array of valid addresses. Received: ${JSON.stringify(allowlist)}`);
      }
      if (!rmnProxy || !ethers.isAddress(rmnProxy)) {
        throw new Error(`Invalid or missing RMN proxy address. Received: ${rmnProxy}`);
      }
      if (!router || !ethers.isAddress(router)) {
        throw new Error(`Invalid or missing router address. Received: ${router}`);
      }

      const provider = ethers.provider;
      const tokenCode = await provider.getCode(token);
      if (tokenCode === '0x') {
        throw new Error(`No contract deployed at the provided token address: ${token}`);
      }

      const [deployer] = await ethers.getSigners();
      console.log(`[INFO] Deploying contracts with account: ${deployer.address}`);
      console.log(`[INFO] Account balance: ${(await provider.getBalance(deployer.address)).toString()}`);

      // --- Deploy Contract ---
      console.log('[INFO] Deploying BurnMintTokenPool contract...');
      const ContractFactory = await ethers.getContractFactory('BurnMintTokenPool');
      
      console.log('[INFO] Starting deployment transaction...');
      const pool = await ContractFactory.deploy(
        token,
        parsedDecimals,
        allowlist,
        rmnProxy,
        router,
        { gasLimit: 8000000 }
      );

      console.log('[INFO] Waiting for deployment to be confirmed...');
      const receipt = await pool.waitForDeployment();
      const poolAddress = await pool.getAddress();

      // THIS IS THE CRITICAL OUTPUT LINE THE SERVER PARSES
      console.log(`Pool deployed to: ${poolAddress}`);

      console.log('[INFO] Deployment successful.');
      console.log('[DEBUG] Full deployment details:', {
        txHash: receipt.deploymentTransaction().hash,
        blockNumber: receipt.deploymentTransaction().blockNumber,
      });

      // --- Optional: Verification Step ---
      const network = await ethers.provider.getNetwork();
      const networkName = network.name;
      
      if (process.env.VERIFY_CONTRACT === "true" && networkName !== 'hardhat' && networkName !== 'localhost') {
        console.log(`[INFO] Starting contract verification on ${networkName} (may take a moment)...`);
        await receipt.deploymentTransaction().wait(5);

        try {
          await hre.run("verify:verify", {
            address: poolAddress,
            constructorArguments: [token, parsedDecimals, allowlist, rmnProxy, router],
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
        console.error('[FATAL] Pool deployment script failed:', error);
        process.exit(1);
      });
    