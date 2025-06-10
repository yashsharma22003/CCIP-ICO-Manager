// scripts/deployToken.js
const { ethers } = require("hardhat");


async function main() {

    const abi = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "tokenAdminRegistry",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "AddressZero",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "admin",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "CanOnlySelfRegister",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "msgSender",
                    "type": "address"
                },
                {
                    "internalType": "bytes32",
                    "name": "role",
                    "type": "bytes32"
                },
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "RequiredRoleNotFound",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "administrator",
                    "type": "address"
                }
            ],
            "name": "AdministratorRegistered",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "registerAccessControlDefaultAdmin",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "registerAdminViaGetCCIPAdmin",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "registerAdminViaOwner",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "typeAndVersion",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    const registryModuleOwnerCustom = "0x62e731218d0D47305aba2BE3751E7EE9E5520790";
    const tokenAddress = "0xe929B9C25Be12B4D5139ED1a21b2b23E4B0d1522"

    const [deployer] = await ethers.getSigners();
    console.log(`Deploying Registry Module with account: ${deployer.address}`);

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // 1. Deploy contract
    const contract = await ethers.getContractFactory('RegistryModuleOwnerCustom');
    const registry = await contract.deploy(registryModuleOwnerCustom);
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();

    console.log(`Registry deployed to: ${registryAddress}`);
    console.log(`Deployer address: ${deployer.address}`);

    const registryContractInstaance = new ethers.Contract(registryAddress, abi, wallet);
    console.log("Setup Registry Module Owner Custom Contract Instance:", registryContractInstaance);
    const tx = await registryContractInstaance.registerAdminViaGetCCIPAdmin(tokenAddress);
    await tx.wait();
    console.log("Admin registered via GetCCIPAdmin", tx.hash);

    // 2. Verification (skip for local networks)
    if (process.env.VERIFY_CONTRACT === "true") {
        console.log("Verifying contract...");

        // Wait for block confirmations
        await registry.deploymentTransaction().wait(5);

        try {
            // Run verification task
            await hre.run("verify:verify", {
                address: registryAddress,
                constructorArguments: [registryModuleOwnerCustom],
            });
            console.log("Contract verified successfully");





            return registryAddress;
        }



        catch (error) {
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