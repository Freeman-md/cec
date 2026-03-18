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

    uint256 public constant INITIAL_TICKET_ID = 1;

    address public immutable admin;
    address public platform;
    uint256 public nextTicketId = INITIAL_TICKET_ID;

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

    constructor(address _admin) ERC721("Campus Event Ticket", "CET") Ownable(_admin) {
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

    function mint(address _to, uint256 _eventId, uint256 _tierId) external onlyPlatform returns (uint256 ticketId) {
        if (_to == address(0)) revert ZeroAddress();

        ticketId = nextTicketId++;
        _safeMint(_to, ticketId);
        ticketStates[ticketId] = TicketState.Active;
        ticketEventIds[ticketId] = _eventId;
        ticketTierIds[ticketId] = _tierId;

        emit TicketMinted(ticketId, _to, _eventId, _tierId);
    }

    function markUsed(uint256 _ticketId) external onlyPlatform {
        if (ticketStates[_ticketId] != TicketState.Active) revert InvalidTicketState();
        ticketStates[_ticketId] = TicketState.Used;
        emit TicketMarkedUsed(_ticketId);
    }

    function invalidate(uint256 _ticketId) external onlyPlatform {
        if (ticketStates[_ticketId] != TicketState.Active) revert InvalidTicketState();
        ticketStates[_ticketId] = TicketState.Invalidated;
        emit TicketInvalidated(_ticketId);
    }

    function markRefunded(uint256 _ticketId) external onlyPlatform {
        if (ticketStates[_ticketId] != TicketState.Invalidated) revert InvalidTicketState();
        ticketStates[_ticketId] = TicketState.Refunded;
        emit TicketRefunded(_ticketId);
    }

    function approve(address _to, uint256 _ticketId) public pure override {
        (_to, _ticketId);
        revert NonTransferable();
    }

    function setApprovalForAll(address _operator, bool _approved) public pure override {
        (_operator, _approved);
        revert NonTransferable();
    }

    function transferFrom(address _from, address _to, uint256 _ticketId) public pure override {
        (_from, _to, _ticketId);
        revert NonTransferable();
    }

    function safeTransferFrom(address _from, address _to, uint256 _ticketId, bytes memory _data) public pure override {
        (_from, _to, _ticketId, _data);
        revert NonTransferable();
    }
}
