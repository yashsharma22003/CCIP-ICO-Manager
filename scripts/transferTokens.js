// scripts/transferTokens.js
const { ethers } = require("hardhat");

/**
 * @notice This script facilitates transferring ERC20 tokens across chains using Chainlink CCIP.
 * It approves the token for spending by the CCIP Router, calculates the necessary fee,
 * and calls the `ccipSend` function to initiate the cross-chain transfer.
 */

// Minimal ABI for the CCIP Router contract
const abiRouter = [
    "function isChainSupported(uint64 chainSelector) external view returns (bool)",
    "function getFee(uint64 destinationChainSelector, tuple(bytes receiver, bytes data, tuple(address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) external view returns (uint256)",
    "function ccipSend(uint64 destinationChainSelector, tuple(bytes receiver, bytes data, tuple(address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) external returns (bytes32 messageId)"
];

// Minimal ABI for an ERC20 token contract
const abiErc20 = [
    "function approve(address spender, uint256 amount) external returns (bool)"
];

async function main() {
    // ##################################################################################
    // #############  START: CONFIGURE YOUR VALUES HERE  ################################
    // ##################################################################################

    // The CCIP Router address on the source chain.
    // Find addresses here: https://docs.chain.link/ccip/supported-networks/
    const sourceRouterAddress = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59"; // Example: Sepolia Router

    // The address of the LINK token on the source chain. Only needed if paying fees in LINK.
    const sourceLinkAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Example: Sepolia LINK

    // The Chainlink CCIP selector for the destination chain.
    const destinationChainSelector = "16281711391670634445"; // Example: Polygon Mumbai

    // The address that will receive the tokens on the destination chain.
    const destinationReceiverAddress = "0x0af700A3026adFddC10f7Aa8Ba2419e8503592f7"; // ❗UPDATE with your receiver address

    // The address of the ERC20 token you want to transfer.
    const tokenAddress = "0x56C213DeAafc3bC2C1B8b5f46fD573935e400299"; // Example: Your deployed token on Sepolia

    // The amount of the token to transfer.
    // The script uses ethers.parseUnits to handle decimals, e.g., "1.5" for 1.5 tokens with 18 decimals.
    const tokenAmountString = "1";
    const tokenDecimals = 18; // The number of decimals for your token

    // The type of fee to pay: "native" or "link".
    const feeType = "link"; // "native" to pay with the chain's native token (e.g., ETH) or "link" to pay with LINK

    // ##################################################################################
    // #############  END: CONFIGURE YOUR VALUES HERE  ##################################
    // ##################################################################################

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Convert the string amount to the smallest unit (e.g., wei)
    const tokenAmount = ethers.parseUnits(tokenAmountString, tokenDecimals);

    try {
        await transferTokens({
            wallet,
            sourceRouterAddress,
            sourceLinkAddress,
            destinationChainSelector,
            destinationReceiverAddress,
            tokenAddress,
            tokenAmount,
            feeType,
        });
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

/**
 * @notice Main function to orchestrate the token transfer via CCIP.
 * @param {object} params - The parameters for the transfer.
 * @param {ethers.Wallet} params.wallet - The wallet to sign transactions.
 * @param {string} params.sourceRouterAddress - The CCIP router address on the source chain.
 * @param {string} params.sourceLinkAddress - The LINK token address on the source chain.
 * @param {string} params.destinationChainSelector - The CCIP selector for the destination chain.
 * @param {string} params.destinationReceiverAddress - The recipient's address.
 * @param {string} params.tokenAddress - The address of the token to transfer.
 * @param {ethers.BigNumberish} params.tokenAmount - The amount of token to transfer (in wei).
 * @param {string} params.feeType - The fee payment method ("native" or "link").
 */
async function transferTokens({
    wallet,
    sourceRouterAddress,
    sourceLinkAddress,
    destinationChainSelector,
    destinationReceiverAddress,
    tokenAddress,
    tokenAmount,
    feeType
}) {
    if (!destinationReceiverAddress || !ethers.isAddress(destinationReceiverAddress)) {
        throw new Error("A valid receiver address on the destination chain must be provided.");
    }

    const routerContract = new ethers.Contract(sourceRouterAddress, abiRouter, wallet);
    const tokenContract = new ethers.Contract(tokenAddress, abiErc20, wallet);

    console.log(`Approving ${ethers.formatUnits(tokenAmount, 18)} tokens for transfer by the Router...`);
    const approveTx = await tokenContract.approve(sourceRouterAddress, tokenAmount);
    await approveTx.wait();
    console.log(`✅ Approved. Transaction hash: ${approveTx.hash}`);

    // Determine fee token address
    const feeTokenAddress = feeType.toLowerCase() === 'link' ? sourceLinkAddress : ethers.ZeroAddress;

    // Build the CCIP message
    const message = {
        receiver: ethers.AbiCoder.defaultAbiCoder().encode(['address'], [destinationReceiverAddress]),
        data: '0x', // No specific data being sent
        tokenAmounts: [{ token: tokenAddress, amount: tokenAmount }],
        feeToken: feeTokenAddress,
        extraArgs: ethers.solidityPacked(['bytes4', 'uint256'], [ethers.id('CCIP EVMExtraArgsV1').slice(0, 10), 0]) // v1 extra args, 0 gas limit
    };

    console.log("Estimating CCIP fee...");
    const fees = await routerContract.getFee(destinationChainSelector, message);
    console.log(`Estimated fees: ${ethers.formatEther(fees)} ${feeType.toUpperCase()}`);

    let messageId;

    if (feeType.toLowerCase() === 'link') {
        console.log("Paying fees with LINK. Approving LINK spend...");
        const linkTokenContract = new ethers.Contract(sourceLinkAddress, abiErc20, wallet);
        const approveLinkTx = await linkTokenContract.approve(sourceRouterAddress, fees);
        await approveLinkTx.wait();
        console.log(`✅ LINK Approved. Transaction hash: ${approveLinkTx.hash}`);

        console.log("Sending cross-chain message with LINK fees...");
        const ccipSendTx = await routerContract.ccipSend(destinationChainSelector, message);
        const receipt = await ccipSendTx.wait();
        messageId = receipt.logs[0].data; // The message ID is in the event log data
    } else {
        console.log("Sending cross-chain message with native fees...");
        const ccipSendTx = await routerContract.ccipSend(destinationChainSelector, message, { value: fees });
        const receipt = await ccipSendTx.wait();
        // The messageId is returned by the ccipSend function, we get it from the event logs
        // This is a robust way to get it in case of contract changes.
        // The CCIPSendRequested event's first topic is the messageId.
        const eventTopic = ethers.id("CCIPSendRequested(bytes32)");
        const log = receipt.logs.find(l => l.topics[0] === eventTopic);
        messageId = log.topics[1];
    }

    console.log("✅ CCIP message sent!");
    console.log(`Message ID: ${messageId}`);
    console.log(`Check status at: https://ccip.chain.link/msg/${messageId}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });