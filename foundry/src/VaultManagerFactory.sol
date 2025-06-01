//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract VaultManagerFactory {
    error NotOwner__VaultManagerFactory();
    error InvalidChainsArray__VaultManagerFactory();
    error InvalidPrice__VaultManagerFactory();

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, NotOwner__VaultManagerFactory());
        _;
    }

    function initializeVault(bytes32[] memory _chains, uint256 _price, string memory _symbol, string memory _name, uint8 _decimals) public onlyOwner {
        require(_chains.length > 0, InvalidChainsArray__VaultManagerFactory());
        require(_price > 0, InvalidPrice__VaultManagerFactory());
        // Here you would typically deploy a new VaultManager contract
    }
}
