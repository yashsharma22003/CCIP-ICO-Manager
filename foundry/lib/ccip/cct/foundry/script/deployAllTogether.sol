//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {DeployToken} from "./DeployToken.s.sol";
import {DeployBurnMintTokenPool} from "./DeployBurnMintTokenPool.s.sol";
import {SetPool} from "./setPool.s.sol";
import {TransaferTokens} from "./TransferTokens.s.sol";

contract DeployAllTogether {

    DeployToken public deployToken;
    DeployBurnMintTokenPool public deployBurnMintTokenPool;
    SetPool public setPool;
    TransaferTokens public transaferTokens;

    constructor() {
        deployToken = new DeployToken();
        deployBurnMintTokenPool = new DeployBurnMintTokenPool();
        setPool = new SetPool();
        transaferTokens = new TransaferTokens();
    }

    function deployAll() external {
        deployToken.deploy();
        deployBurnMintTokenPool.deploy();
        setPool.set();
        transaferTokens.transfer();
    }

}