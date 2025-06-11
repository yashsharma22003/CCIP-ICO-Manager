  const express = require('express');
    const { exec } = require('child_process');
    const util = require('util');
    const dotenv = require('dotenv');

    // Load environment variables
    dotenv.config();

    const app = express();
    const port = process.env.PORT || 3000;

    // Promisify exec for async/await
    const execPromise = util.promisify(exec);

    // Middleware to parse JSON requests
    app.use(express.json());

    /**
     * Helper function to parse deployment output for an address.
     * @param {string} stdout - The standard output from the deployment script.
     * @param {string} prefix - The line prefix to search for (e.g., "Pool deployed to:").
     * @returns {string} The extracted address or "Unknown".
     */
    const getAddressFromOutput = (stdout, prefix) => {
      try {
        const outputLines = stdout.split('\n');
        const addressLine = outputLines.find(line => line.startsWith(prefix));
        return addressLine ? addressLine.split(prefix)[1].trim() : 'Unknown';
      } catch (error) {
        console.error('[ERROR] Failed to parse address from output:', error);
        return 'Parsing Error';
      }
    };


    // API endpoint to deploy BurnMintERC20 token
    app.post('/deploy-token', async (req, res) => {
      try {
        const { network, verify } = req.body;

        // Validate network parameter
        if (!network) {
          return res.status(400).json({ error: 'Network parameter is required' });
        }
        
        // --- Environment setup for the script ---
        const env = {
          ...process.env, // Inherit parent environment
          // Pass the verification flag to the script
          
          VERIFY_CONTRACT: verify ? "true" : "false",
        };

        // Run the Hardhat deploy script with network flag
        console.log(`[INFO] Starting token deployment on network: ${network} (Verify: ${!!verify})`);
        const command = `npx hardhat run scripts/deployToken.js --network ${network}`;
        const { stdout, stderr } = await execPromise(command, { env });

        console.log('[DEBUG] Token deployment stdout:', stdout);
        if (stderr) {
          console.warn('[DEBUG] Token deployment stderr:', stderr);
        }

        // Parse the output to extract the token address
        const tokenAddress = getAddressFromOutput(stdout, 'Token deployed to: ');

        // Send response
        res.json({
          success: true,
          tokenAddress,
          output: stdout,
        });
      } catch (error) {
        console.error('[ERROR] Token deployment failed:', error.message);
        res.status(500).json({
          success: false,
          error: error.message,
          stdout: error.stdout,
          stderr: error.stderr,
        });
      }
    });

    // API endpoint to deploy BurnMintTokenPool
    app.post('/deploy-pool', async (req, res) => {
      try {
        const { network, token, localTokenDecimals, allowlist, rmnProxy, router, verify } = req.body;

        // --- Parameter Validation ---
        const requiredParams = { network, token, localTokenDecimals, rmnProxy, router };
        for (const [param, value] of Object.entries(requiredParams)) {
            if (value === undefined || value === null) {
                return res.status(400).json({ error: `Parameter '${param}' is required.` });
            }
        }
        if (allowlist && !Array.isArray(allowlist)) {
            return res.status(400).json({ error: 'allowlist must be an array of addresses.' });
        }

        // --- Environment setup for the script ---
        const env = {
          ...process.env, // Inherit parent environment
          TOKEN: token,
          DECIMALS: localTokenDecimals.toString(),
          ALLOWLIST: JSON.stringify(allowlist || []),
          RMN_PROXY: rmnProxy,
          ROUTER: router,
          // Pass the verification flag to the script
          VERIFY_CONTRACT: verify ? "true" : "false",
        };
        
        console.log(`[INFO] Starting pool deployment on network: ${network} (Verify: ${!!verify})`);
        console.log('[DEBUG] Executing pool deployment with env:', { token, localTokenDecimals, allowlist, rmnProxy, router });

        // --- Run the Hardhat script ---
        const command = `npx hardhat run scripts/deployTokenPool.js --network ${network}`;
        const { stdout, stderr } = await execPromise(command, { env });

        console.log('[DEBUG] Pool deployment stdout:', stdout);
        if (stderr) {
            console.warn('[DEBUG] Pool deployment stderr:', stderr);
        }

        // --- Parse output and respond ---
        const poolAddress = getAddressFromOutput(stdout, 'Pool deployed to: ');

        if (poolAddress === 'Unknown' || poolAddress === 'Parsing Error') {
            console.error('[ERROR] Could not find pool address in script output.');
             return res.status(500).json({
                success: false,
                error: 'Script executed but failed to return a valid address.',
                poolAddress,
                output: stdout,
             });
        }

        res.json({
          success: true,
          poolAddress,
          output: stdout,
        });

      } catch (error) {
        // This block now catches errors because the child script will exit with a failure code
        console.error('[ERROR] Pool deployment failed:', error.message);

        let details = 'The deployment script failed to execute.';
        if (error.stderr) {
            if (error.stderr.includes('CALL_EXCEPTION')) {
                 details = 'Transaction execution reverted. This is often due to an insufficient gas limit or a require() statement failing in the contract constructor. Check the contract logic and try increasing the gas limit in the deployment script.';
            } else if (error.stderr.includes(`Cannot read properties of undefined (reading 'network')`)) {
                details = 'Script failed during verification step due to an issue accessing the Hardhat Runtime Environment. The deployment likely succeeded, but verification failed.'
            }
        }

        res.status(500).json({
          success: false,
          error: details,
          rawError: error.message,
          stdout: error.stdout,
          stderr: error.stderr,
        });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`[INFO] Server running on port ${port}`);
    });