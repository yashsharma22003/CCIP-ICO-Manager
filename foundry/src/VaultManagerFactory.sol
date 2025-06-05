//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { BurnMintERC20 } from "@chainlink/contracts/src/v0.8/shared/token/ERC20/BurnMintERC20.sol";

contract VaultManagerFactory {
    error NotOwner__VaultManagerFactory();
    error InvalidChainsArray__VaultManagerFactory();
    error InvalidPrice__VaultManagerFactory();

    address public owner;
    BurnMintERC20 public cctToken;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if(msg.sender != owner) 
        revert NotOwner__VaultManagerFactory();
        _;
    }

    function initializeVault(bytes32[] memory _chains, uint256 _price, string memory _symbol, string memory _name, uint8 _decimals, uint256 _maxSupply, uint256 _preMint) public onlyOwner {
       
        if(_chains.length < 0) 
        revert InvalidChainsArray__VaultManagerFactory();

        if(_price < 0)
        revert InvalidPrice__VaultManagerFactory();

        cctToken = new BurnMintERC20(_name, _symbol, _decimals, _maxSupply, _preMint);
        
    }
}
