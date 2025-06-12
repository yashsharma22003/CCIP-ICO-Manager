// scripts/mintTokens.js
const { ethers } = require("hardhat");

/**
 * @notice This script mints a specified amount of a BurnMintERC20 token to a given address.
 * It is intended to be used by the token's owner or an account with minting privileges.
 * The script reads the token contract address and the amount to mint from the configuration section.
 */

// Minimal ABI for a BurnMintERC20 token, including only the necessary functions.
const abiBurnMintErc20 = [
    // The event emitted when tokens are minted
    "event Transfer(address indexed from, address indexed to, uint256 value)",

    // The function to mint new tokens
    "function mint(address to, uint256 amount) external",

    // Functions to check token details
    "function balanceOf(address account) external view returns (uint256)",
    "function symbol() external view returns (string)"
];

async function main() {
    // ##################################################################################
    // #############  START: CONFIGURE YOUR VALUES HERE  ################################
    // ##################################################################################

    // The deployed address of your BurnMintERC20 token contract.
    const tokenAddress = "0x56C213DeAafc3bC2C1B8b5f46fD573935e400299"; // ❗UPDATE with your token address

    // The address that will receive the newly minted tokens.
    // If you leave this as an empty string '', it will default to the wallet address running the script.
    let receiverAddress = "0x0af700A3026adFddC10f7Aa8Ba2419e8503592f7"; // ❗UPDATE or leave empty to use your wallet address

    // The amount of tokens to mint.
    // Use a string to avoid precision issues. e.g., "1000" for 1000 tokens.
    const amountToMintString = "1000";

    // The number of decimals your ERC20 token uses (e.g., 18 for most tokens).
    const tokenDecimals = 18;

    // ##################################################################################
    // #############  END: CONFIGURE YOUR VALUES HERE  ##################################
    // ##################################################################################

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // If receiverAddress is not set, default to the signer's address.
    if (!receiverAddress) {
        receiverAddress = wallet.address;
        console.log(`Receiver address not specified, defaulting to sender: ${receiverAddress}`);
    }

    // Convert the string amount to the correct BigNumber format with decimals.
    const amountToMint = ethers.parseUnits(amountToMintString, tokenDecimals);

    try {
        await mintTokens(tokenAddress, receiverAddress, amountToMint, wallet);
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

/**
 * @notice Connects to the token contract and calls the mint function.
 * @param {string} tokenAddress - The address of the BurnMintERC20 contract.
 * @param {string} receiverAddress - The address to receive the minted tokens.
 * @param {ethers.BigNumberish} amount - The amount of tokens to mint (in the smallest unit, e.g., wei).
 * @param {ethers.Wallet} wallet - The wallet instance of the minter.
 */
async function mintTokens(tokenAddress, receiverAddress, amount, wallet) {
    if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
        throw new Error("A valid token contract address must be provided.");
    }
    try {
        const tokenContract = new ethers.Contract(tokenAddress, abiBurnMintErc20, wallet);
        const tokenSymbol = await tokenContract.symbol();

        console.log(`Attempting to mint ${ethers.formatUnits(amount, 18)} ${tokenSymbol} to address: ${receiverAddress}`);

        // Call the mint function on the contract
        const tx = await tokenContract.mint(receiverAddress, amount);
        console.log(`Mint transaction sent. Hash: ${tx.hash}`);
        console.log("Waiting for transaction confirmation...");

        await tx.wait();

        console.log("✅ Tokens minted successfully!");

        // Check and log the new balance
        const newBalance = await tokenContract.balanceOf(receiverAddress);
        console.log(`New balance of ${receiverAddress}: ${ethers.formatUnits(newBalance, 18)} ${tokenSymbol}`);

    } catch (error) {
        console.error("❌ Error minting tokens:", error.reason || error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });