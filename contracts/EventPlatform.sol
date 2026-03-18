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

    error NotApprovedOrganizer();
    error InvalidRate();
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
}
