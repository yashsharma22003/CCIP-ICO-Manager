// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ico is Ownable {
    IERC20 public token;
    uint256 public rate; // Tokens per ETH
    uint256 public start;
    uint256 public end;
    address public fundRecipient;

    constructor(address _token, uint256 _rate, uint256 _start, uint256 _end, address _fundRecipient) Ownable(msg.sender) {
        token = IERC20(_token);
        rate = _rate;
        start = _start;
        end = _end;
        fundRecipient = _fundRecipient;
    }

    

    receive() external payable {
        require(block.timestamp >= start && block.timestamp <= end, "ICO not active");
        require(msg.value > 0, "Zero ETH sent");

        uint256 tokenAmount = msg.value * rate;
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient tokens in contract");

        token.transfer(msg.sender, tokenAmount);
        payable(fundRecipient).transfer(msg.value);
    }

    function withdrawRemainingTokens() external onlyOwner {
        uint256 bal = token.balanceOf(address(this));
        token.transfer(owner(), bal);
    }
}
