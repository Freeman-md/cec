// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {CreditsToken} from "./CreditsToken.sol";
import {TicketNFT} from "./TicketNFT.sol";
import {TreasuryVault} from "./TreasuryVault.sol";

contract EventPlatform is Ownable {
    enum EventState {
        Draft,
        OnSale,
        SoldOut,
        Cancelled,
        Completed
    }

    struct EventData {
        uint256 eventId;
        address organizer;
        EventState state;
        uint256 walletCap;
        bool payoutReleased;
    }

    struct TicketTier {
        uint256 tierId;
        uint256 eventId;
        string label;
        uint256 priceInCredits;
        uint256 maxSupply;
        uint256 soldCount;
    }

    address public immutable admin;
    CreditsToken public immutable creditsToken;
    TicketNFT public immutable ticketNFT;
    TreasuryVault public immutable treasuryVault;

    uint256 public ethToCreditsRate;
    uint256 public nextEventId = 1;

    mapping(address => bool) public approvedOrganizers;
    mapping(uint256 => EventData) public events;
    mapping(uint256 => uint256) public nextTierIdByEvent;
    mapping(uint256 => mapping(uint256 => TicketTier)) public ticketTiers;
    mapping(uint256 => mapping(address => uint256)) public walletPurchases;

    event OrganizerApprovalUpdated(address indexed organizer, bool approved);
    event EthToCreditsRateUpdated(uint256 oldRate, uint256 newRate);
    event EventCreated(uint256 indexed eventId, address indexed organizer);
    event TicketTierCreated(
        uint256 indexed eventId,
        uint256 indexed tierId,
        string label,
        uint256 priceInCredits,
        uint256 maxSupply
    );
    event WalletCapUpdated(uint256 indexed eventId, uint256 walletCap);
    event TicketSalesStarted(uint256 indexed eventId);

    error NotApprovedOrganizer();
    error NotEventOrganizer();
    error InvalidRate();
    error InvalidWalletCap();
    error InvalidTierConfiguration();
    error InvalidEventState();
    error ZeroAddress();

    constructor(
        address admin_,
        address creditsToken_,
        address ticketNFT_,
        address treasuryVault_,
        uint256 initialEthToCreditsRate
    ) Ownable(admin_) {
        if (
            admin_ == address(0) || creditsToken_ == address(0) || ticketNFT_ == address(0) || treasuryVault_ == address(0)
        ) revert ZeroAddress();
        if (initialEthToCreditsRate == 0) revert InvalidRate();

        admin = admin_;
        creditsToken = CreditsToken(creditsToken_);
        ticketNFT = TicketNFT(ticketNFT_);
        treasuryVault = TreasuryVault(treasuryVault_);
        ethToCreditsRate = initialEthToCreditsRate;
    }

    modifier onlyApprovedOrganizer() {
        if (!approvedOrganizers[msg.sender]) revert NotApprovedOrganizer();
        _;
    }

    modifier onlyEventOrganizer(uint256 eventId) {
        if (events[eventId].organizer != msg.sender) revert NotEventOrganizer();
        _;
    }

    function approveOrganizer(address organizer, bool approved) external onlyOwner {
        if (organizer == address(0)) revert ZeroAddress();
        approvedOrganizers[organizer] = approved;
        emit OrganizerApprovalUpdated(organizer, approved);
    }

    function updateEthToCreditsRate(uint256 newRate) external onlyOwner {
        if (newRate == 0) revert InvalidRate();

        uint256 oldRate = ethToCreditsRate;
        ethToCreditsRate = newRate;

        emit EthToCreditsRateUpdated(oldRate, newRate);
    }

    function createEvent() external onlyApprovedOrganizer returns (uint256 eventId) {
        eventId = nextEventId++;
        events[eventId] = EventData({
            eventId: eventId,
            organizer: msg.sender,
            state: EventState.Draft,
            walletCap: 1,
            payoutReleased: false
        });

        emit EventCreated(eventId, msg.sender);
    }

    function createTicketTier(
        uint256 eventId,
        string calldata label,
        uint256 priceInCredits,
        uint256 maxSupply
    ) external onlyEventOrganizer(eventId) returns (uint256 tierId) {
        if (events[eventId].state != EventState.Draft) revert InvalidEventState();
        if (bytes(label).length == 0 || priceInCredits == 0 || maxSupply == 0) revert InvalidTierConfiguration();

        tierId = ++nextTierIdByEvent[eventId];
        ticketTiers[eventId][tierId] = TicketTier({
            tierId: tierId,
            eventId: eventId,
            label: label,
            priceInCredits: priceInCredits,
            maxSupply: maxSupply,
            soldCount: 0
        });

        emit TicketTierCreated(eventId, tierId, label, priceInCredits, maxSupply);
    }

    function setPerEventWalletCap(uint256 eventId, uint256 walletCap) external onlyEventOrganizer(eventId) {
        if (events[eventId].state != EventState.Draft) revert InvalidEventState();
        if (walletCap == 0) revert InvalidWalletCap();

        events[eventId].walletCap = walletCap;

        emit WalletCapUpdated(eventId, walletCap);
    }

    function startTicketSales(uint256 eventId) external onlyEventOrganizer(eventId) {
        if (events[eventId].state != EventState.Draft) revert InvalidEventState();

        events[eventId].state = EventState.OnSale;

        emit TicketSalesStarted(eventId);
    }
}
