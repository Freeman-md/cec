// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CreditsToken is ERC20, Ownable {
    address public immutable admin;
    address public platform;

    event PlatformUpdated(address indexed platform);
    event CreditsMinted(address indexed to, uint256 amount);
    event CreditsBurned(address indexed from, uint256 amount);

    error NotPlatform();
    error ZeroAddress();

    constructor(address admin_) ERC20("Campus Event Credits", "CEC") Ownable(admin_) {
        if (admin_ == address(0)) revert ZeroAddress();
        admin = admin_;
    }

    modifier onlyPlatform() {
        if (msg.sender != platform) revert NotPlatform();
        _;
    }

    function setPlatform(address platform_) external onlyOwner {
        if (platform_ == address(0)) revert ZeroAddress();
        platform = platform_;
        emit PlatformUpdated(platform_);
    }

    function mint(address to, uint256 amount) external onlyPlatform {
        _mint(to, amount);
        emit CreditsMinted(to, amount);
    }

    function burn(address from, uint256 amount) external onlyPlatform {
        _burn(from, amount);
        emit CreditsBurned(from, amount);
    }
}
