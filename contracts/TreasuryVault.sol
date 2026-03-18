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

    constructor(address _admin) Ownable(_admin) {
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

    function recordTicketSale(uint256 _eventId, uint256 _amountInCredits) external onlyPlatform {
        paidCreditsByEvent[_eventId] += _amountInCredits;
        emit TicketSaleRecorded(_eventId, _amountInCredits);
    }

    function recordRefund(uint256 _eventId, uint256 _amountInCredits) external onlyPlatform {
        refundCreditsByEvent[_eventId] += _amountInCredits;
        emit RefundRecorded(_eventId, _amountInCredits);
    }
}
