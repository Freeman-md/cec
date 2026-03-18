// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TreasuryVault is Ownable {
    address public immutable admin;
    address public platform;

    mapping(uint256 => uint256) public paidCreditsByEvent;
    mapping(uint256 => uint256) public refundCreditsByEvent;

    event PlatformUpdated(address indexed platform);
    event TicketSaleRecorded(uint256 indexed eventId, uint256 amountInCredits);
    event RefundRecorded(uint256 indexed eventId, uint256 amountInCredits);

    error NotPlatform();
    error ZeroAddress();

    constructor(address admin_) Ownable(admin_) {
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

    function recordTicketSale(uint256 eventId, uint256 amountInCredits) external onlyPlatform {
        paidCreditsByEvent[eventId] += amountInCredits;
        emit TicketSaleRecorded(eventId, amountInCredits);
    }

    function recordRefund(uint256 eventId, uint256 amountInCredits) external onlyPlatform {
        refundCreditsByEvent[eventId] += amountInCredits;
        emit RefundRecorded(eventId, amountInCredits);
    }
}
