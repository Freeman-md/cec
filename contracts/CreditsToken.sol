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

    constructor(address _admin) ERC20("Campus Event Credits", "CEC") Ownable(_admin) {
        if (_admin == address(0)) revert ZeroAddress();
        admin = _admin;
    }

    modifier onlyPlatform() {
        if (msg.sender != platform) revert NotPlatform();
        _;
    }

    function setPlatform(address _platform) external onlyOwner {
        if (_platform == address(0)) revert ZeroAddress();
        platform = _platform;
        emit PlatformUpdated(_platform);
    }

    function mint(address _to, uint256 _amount) external onlyPlatform {
        _mint(_to, _amount);
        emit CreditsMinted(_to, _amount);
    }

    function burn(address _from, uint256 _amount) external onlyPlatform {
        _burn(_from, _amount);
        emit CreditsBurned(_from, _amount);
    }
}
