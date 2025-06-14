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

  const abiTokenAdminRegistry = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "AlreadyRegistered",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CannotTransferToSelf",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "InvalidTokenPoolToken",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MustBeProposedOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "OnlyAdministrator",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyCallableByOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "OnlyPendingAdministrator",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "OnlyRegistryModuleOrOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OwnerCannotBeZero",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroAddress",
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
          "name": "currentAdmin",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "AdministratorTransferRequested",
      "type": "event"
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
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "AdministratorTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
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
          "name": "previousPool",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newPool",
          "type": "address"
        }
      ],
      "name": "PoolSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "module",
          "type": "address"
        }
      ],
      "name": "RegistryModuleAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "module",
          "type": "address"
        }
      ],
      "name": "RegistryModuleRemoved",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "localToken",
          "type": "address"
        }
      ],
      "name": "acceptAdminRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "acceptOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "module",
          "type": "address"
        }
      ],
      "name": "addRegistryModule",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "startIndex",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "maxCount",
          "type": "uint64"
        }
      ],
      "name": "getAllConfiguredTokens",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
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
      "name": "getPool",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "tokens",
          "type": "address[]"
        }
      ],
      "name": "getPools",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
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
      "name": "getTokenConfig",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "administrator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "pendingAdministrator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "tokenPool",
              "type": "address"
            }
          ],
          "internalType": "struct TokenAdminRegistry.TokenConfig",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "localToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "administrator",
          "type": "address"
        }
      ],
      "name": "isAdministrator",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "module",
          "type": "address"
        }
      ],
      "name": "isRegistryModule",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "localToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "administrator",
          "type": "address"
        }
      ],
      "name": "proposeAdministrator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "module",
          "type": "address"
        }
      ],
      "name": "removeRegistryModule",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "localToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        }
      ],
      "name": "setPool",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "localToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "transferAdminRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
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
  ];

  const registryModuleOwnerCustom = "0x84ad5890A63957C960e0F19b0448A038a574936B";
  const tokenAdminRegistryAddress = "0x1e73f6842d7afDD78957ac143d1f315404Dd9e5B";
  const tokenAddress = "0x7b645ecDde6a8Fe8EACfcADb2Cd20E7F20C172f3";
  const poolAddress = "0xAa2d629080Bb38Ca8438d8798f2aE8f876154e6D";

  const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  try {
  
    await claimAdmin(tokenAddress, registryModuleOwnerCustom, abi, wallet)

    await acceptAdmin(tokenAddress, tokenAdminRegistryAddress, abiTokenAdminRegistry, wallet)

    await setPool(tokenAddress, poolAddress, tokenAdminRegistryAddress, abiTokenAdminRegistry, wallet);

  }

  catch (error) {
    console.error("Error in main function:", error);
    return;
  }

}




async function claimAdmin(tokenAddress, registryModuleOwnerCustom, abi, wallet) {
  try {
    console.log("Claiming admin for the token...");
    console.log("Registry Module Owner Custom Address:", registryModuleOwnerCustom);
    console.log("Token Address:", tokenAddress);
    console.log("Wallet Address:", wallet.address);

    const registryModule = new ethers.Contract(registryModuleOwnerCustom, abi, wallet);
    const tx = await registryModule.registerAdminViaGetCCIPAdmin(tokenAddress);
    console.log("Administrator registration transaction hash:", tx);
    await tx.wait();
    console.log("Admin claimed successfully, now accepting admin...");
  }
  catch (error) {
    console.error("Error claiming admin:", error);
    return;
  }
}

async function acceptAdmin(tokenAddress, tokenAdminRegistryAddress, abiTokenAdminRegistry, wallet) {
  try {
    console.log("Accepting admin for the token...");
    const adminRegistryModule = new ethers.Contract(tokenAdminRegistryAddress, abiTokenAdminRegistry, wallet);
    const tx = await adminRegistryModule.acceptAdminRole(tokenAddress);
    console.log("Admin acceptance transaction hash:", tx.hash);
    await tx.wait();
    console.log("Admin accepted successfully.");
  }
  catch (error) {
    console.error("Error accepting admin:", error);
    return;
  }
}

async function setPool(tokenAddress, poolAddress, tokenAdminRegistryAddress, abiTokenAdminRegistry, wallet) {
  try {
    console.log("Setting pool for the token...");
    const adminRegistryModule = new ethers.Contract(tokenAdminRegistryAddress, abiTokenAdminRegistry, wallet);
    const tx = await adminRegistryModule.setPool(tokenAddress, poolAddress);
    console.log("Set pool transaction hash:", tx.hash);
    await tx.wait();
    console.log("Pool set successfully.");
  } catch (error) {
    console.error("Error setting pool:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });