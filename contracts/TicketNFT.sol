// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, Ownable {
    enum TicketState {
        Active,
        Invalidated,
        Refunded,
        Used
    }

    address public immutable admin;
    address public platform;
    uint256 public nextTicketId = 1;

    mapping(uint256 => TicketState) public ticketStates;
    mapping(uint256 => uint256) public ticketEventIds;
    mapping(uint256 => uint256) public ticketTierIds;

    event PlatformUpdated(address indexed platform);
    event TicketMinted(uint256 indexed ticketId, address indexed owner, uint256 indexed eventId, uint256 tierId);
    event TicketMarkedUsed(uint256 indexed ticketId);
    event TicketInvalidated(uint256 indexed ticketId);
    event TicketRefunded(uint256 indexed ticketId);

    error NotPlatform();
    error ZeroAddress();
    error InvalidTicketState();
    error NonTransferable();

    constructor(address admin_) ERC721("Campus Event Ticket", "CET") Ownable(admin_) {
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

    function mint(address to, uint256 eventId, uint256 tierId) external onlyPlatform returns (uint256 ticketId) {
        if (to == address(0)) revert ZeroAddress();

        ticketId = nextTicketId++;
        _safeMint(to, ticketId);
        ticketStates[ticketId] = TicketState.Active;
        ticketEventIds[ticketId] = eventId;
        ticketTierIds[ticketId] = tierId;

        emit TicketMinted(ticketId, to, eventId, tierId);
    }

    function markUsed(uint256 ticketId) external onlyPlatform {
        if (ticketStates[ticketId] != TicketState.Active) revert InvalidTicketState();
        ticketStates[ticketId] = TicketState.Used;
        emit TicketMarkedUsed(ticketId);
    }

    function invalidate(uint256 ticketId) external onlyPlatform {
        if (ticketStates[ticketId] != TicketState.Active) revert InvalidTicketState();
        ticketStates[ticketId] = TicketState.Invalidated;
        emit TicketInvalidated(ticketId);
    }

    function markRefunded(uint256 ticketId) external onlyPlatform {
        if (ticketStates[ticketId] != TicketState.Invalidated) revert InvalidTicketState();
        ticketStates[ticketId] = TicketState.Refunded;
        emit TicketRefunded(ticketId);
    }

    function approve(address, uint256) public pure override {
        revert NonTransferable();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert NonTransferable();
    }

    function transferFrom(address, address, uint256) public pure override {
        revert NonTransferable();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert NonTransferable();
    }
}
