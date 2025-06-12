// scripts/applyChainUpdate.js
const { ethers } = require("hardhat");

/**
 * @notice This script configures a TokenPool contract to allow token transfers to a remote chain.
 * It specifies the remote chain's CCIP selector, the remote token contract, and its corresponding pool.
 * It's the final step to link two TokenPools across different chains.
 */

// ABI for the Chainlink CCIP TokenPool contract, focusing on the applyChainUpdates function.
const abiTokenPool = [
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint64",
              "name": "remoteChainSelector",
              "type": "uint64"
            },
            {
              "internalType": "bytes[]",
              "name": "remotePoolAddresses",
              "type": "bytes[]"
            },
            {
              "internalType": "bytes",
              "name": "remoteTokenAddress",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "bool",
                  "name": "isEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "uint128",
                  "name": "capacity",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "rate",
                  "type": "uint128"
                }
              ],
              "internalType": "struct RateLimiter.Config",
              "name": "outboundRateLimiterConfig",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "bool",
                  "name": "isEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "uint128",
                  "name": "capacity",
                  "type": "uint128"
                },
                {
                  "internalType": "uint128",
                  "name": "rate",
                  "type": "uint128"
                }
              ],
              "internalType": "struct RateLimiter.Config",
              "name": "inboundRateLimiterConfig",
              "type": "tuple"
            }
          ],
          "name": "chainUpdate",
          "type": "tuple"
        }
      ],
      "name": "ChainUpdateIsInvalid",
      "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint64[]",
                "name": "chainSelectorRemovals",
                "type": "uint64[]"
            },
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "remoteChainSelector",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bytes[]",
                        "name": "remotePoolAddresses",
                        "type": "bytes[]"
                    },
                    {
                        "internalType": "bytes",
                        "name": "remoteTokenAddress",
                        "type": "bytes"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bool",
                                "name": "isEnabled",
                                "type": "bool"
                            },
                            {
                                "internalType": "uint128",
                                "name": "capacity",
                                "type": "uint128"
                            },
                            {
                                "internalType": "uint128",
                                "name": "rate",
                                "type": "uint128"
                            }
                        ],
                        "internalType": "struct RateLimiter.Config",
                        "name": "outboundRateLimiterConfig",
                        "type": "tuple"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bool",
                                "name": "isEnabled",
                                "type": "bool"
                            },
                            {
                                "internalType": "uint128",
                                "name": "capacity",
                                "type": "uint128"
                            },
                            {
                                "internalType": "uint128",
                                "name": "rate",
                                "type": "uint128"
                            }
                        ],
                        "internalType": "struct RateLimiter.Config",
                        "name": "inboundRateLimiterConfig",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct TokenPool.ChainUpdate[]",
                "name": "chainUpdates",
                "type": "tuple[]"
            }
        ],
        "name": "applyChainUpdates",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];


async function main() {
    // ##################################################################################
    // #############  START: CONFIGURE YOUR VALUES HERE  ################################
    // ##################################################################################

    // The address of the TokenPool contract on the current (source) chain.
    const localPoolAddress = "0xAa2d629080Bb38Ca8438d8798f2aE8f876154e6D"; // Example: Sepolia Pool

    // The Chainlink CCIP selector for the destination chain.
    // Find selectors here: https://docs.chain.link/ccip/supported-networks
    const remoteChainSelector = "16015286601757825753"; // Example: Mumbai

    // The address of the token on the destination chain.
    const remoteTokenAddress = "0x56C213DeAafc3bC2C1B8b5f46fD573935e400299"; // ❗UPDATE with remote token address

    // The address of the TokenPool on the destination chain.
    const remotePoolAddress = "0x6521CB0253E6Be9b1B232c795aE4649CEDb55a97"; // ❗UPDATE with remote pool address

    // ##################################################################################
    // #############  END: CONFIGURE YOUR VALUES HERE  ##################################
    // ##################################################################################

    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    try {
        await applyChainUpdate(
            localPoolAddress,
            remoteChainSelector,
            remoteTokenAddress,
            remotePoolAddress,
            wallet
        );
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

/**
 * @notice Applies a chain update to the local TokenPool contract.
 * @param localPoolAddress The address of the source chain's TokenPool.
 * @param remoteChainSelector The CCIP selector of the destination chain.
 * @param remoteTokenAddress The token address on the destination chain.
 * @param remotePoolAddress The TokenPool address on the destination chain.
 * @param wallet The ethers wallet instance for signing the transaction.
 */
async function applyChainUpdate(localPoolAddress, remoteChainSelector, remoteTokenAddress, remotePoolAddress, wallet) {
    if (!localPoolAddress || !remoteChainSelector || !remoteTokenAddress || !remotePoolAddress) {
        throw new Error("One or more required parameters are missing. Please check your configuration.");
    }
    try {
        console.log(`Applying chain update to pool: ${localPoolAddress}`);
        console.log(`Configuring for remote chain selector: ${remoteChainSelector}`);

        const localPoolContract = new ethers.Contract(localPoolAddress, abiTokenPool, wallet);

        // An empty array, as we are adding a new configuration, not removing one.
        const chainSelectorRemovals = [];

        // Construct the chain update payload.
        // The addresses are ABI-encoded to bytes, as required by the TokenPool contract.
        const chainUpdates = [
            {
                remoteChainSelector: remoteChainSelector,
                remotePoolAddresses: [ethers.AbiCoder.defaultAbiCoder().encode(['address'], [remotePoolAddress])],
                remoteTokenAddress: ethers.AbiCoder.defaultAbiCoder().encode(['address'], [remoteTokenAddress]),
                // Rate limiters are disabled by default as in the Solidity script.
                // Set isEnabled to true and configure capacity/rate to enable them.
                outboundRateLimiterConfig: {
                    isEnabled: false,
                    capacity: 0,
                    rate: 0,
                },
                inboundRateLimiterConfig: {
                    isEnabled: false,
                    capacity: 0,
                    rate: 0,
                },
            },
        ];

        console.log("Submitting applyChainUpdates transaction...");

        const tx = await localPoolContract.applyChainUpdates(chainSelectorRemovals, chainUpdates);

        console.log("Transaction sent. Hash:", tx.hash);
        console.log("Waiting for transaction confirmation...");

        await tx.wait();

        console.log("✅ Chain update applied successfully!");
    } catch (error) {
        console.error("❌ Error applying chain update:", error.reason || error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });