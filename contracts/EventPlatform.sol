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

    uint256 public constant DEFAULT_WALLET_CAP = 1;

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
    event CreditsPurchased(address indexed buyer, uint256 ethSpent, uint256 creditsMinted);
    event TicketObtained(
        uint256 indexed eventId,
        uint256 indexed tierId,
        uint256 indexed ticketId,
        address buyer,
        uint256 amountInCredits
    );

    error NotApprovedOrganizer();
    error NotEventOrganizer();
    error InvalidRate();
    error InvalidWalletCap();
    error InvalidTierConfiguration();
    error InvalidEventState();
    error UnknownTier();
    error WalletCapExceeded();
    error TierSoldOut();
    error ZeroValue();
    error ZeroAddress();

    constructor(
        address _admin,
        address _creditsToken,
        address _ticketNFT,
        address _treasuryVault,
        uint256 _initialEthToCreditsRate
    ) Ownable(_admin) {
        if (
            _admin == address(0) || _creditsToken == address(0) || _ticketNFT == address(0)
                || _treasuryVault == address(0)
        ) revert ZeroAddress();
        if (_initialEthToCreditsRate == 0) revert InvalidRate();

        admin = _admin;
        creditsToken = CreditsToken(_creditsToken);
        ticketNFT = TicketNFT(_ticketNFT);
        treasuryVault = TreasuryVault(_treasuryVault);
        ethToCreditsRate = _initialEthToCreditsRate;
    }

    modifier onlyApprovedOrganizer() {
        if (!approvedOrganizers[msg.sender]) revert NotApprovedOrganizer();
        _;
    }

    modifier onlyEventOrganizer(uint256 _eventId) {
        if (events[_eventId].organizer != msg.sender) revert NotEventOrganizer();
        _;
    }

    function approveOrganizer(address _organizer, bool _approved) external onlyOwner {
        if (_organizer == address(0)) revert ZeroAddress();
        approvedOrganizers[_organizer] = _approved;
        emit OrganizerApprovalUpdated(_organizer, _approved);
    }

    function updateEthToCreditsRate(uint256 _newRate) external onlyOwner {
        if (_newRate == 0) revert InvalidRate();

        uint256 oldRate = ethToCreditsRate;
        ethToCreditsRate = _newRate;

        emit EthToCreditsRateUpdated(oldRate, _newRate);
    }

    function createEvent() external onlyApprovedOrganizer returns (uint256 eventId) {
        eventId = nextEventId++;
        events[eventId] = EventData({
            eventId: eventId,
            organizer: msg.sender,
            state: EventState.Draft,
            walletCap: DEFAULT_WALLET_CAP,
            payoutReleased: false
        });

        emit EventCreated(eventId, msg.sender);
    }

    function createTicketTier(
        uint256 _eventId,
        string calldata _label,
        uint256 _priceInCredits,
        uint256 _maxSupply
    ) external onlyEventOrganizer(_eventId) returns (uint256 tierId) {
        if (events[_eventId].state != EventState.Draft) revert InvalidEventState();
        if (bytes(_label).length == 0 || _priceInCredits == 0 || _maxSupply == 0) revert InvalidTierConfiguration();

        tierId = ++nextTierIdByEvent[_eventId];
        ticketTiers[_eventId][tierId] = TicketTier({
            tierId: tierId,
            eventId: _eventId,
            label: _label,
            priceInCredits: _priceInCredits,
            maxSupply: _maxSupply,
            soldCount: 0
        });

        emit TicketTierCreated(_eventId, tierId, _label, _priceInCredits, _maxSupply);
    }

    function setPerEventWalletCap(uint256 _eventId, uint256 _walletCap) external onlyEventOrganizer(_eventId) {
        if (events[_eventId].state != EventState.Draft) revert InvalidEventState();
        if (_walletCap == 0) revert InvalidWalletCap();

        events[_eventId].walletCap = _walletCap;

        emit WalletCapUpdated(_eventId, _walletCap);
    }

    function startTicketSales(uint256 _eventId) external onlyEventOrganizer(_eventId) {
        if (events[_eventId].state != EventState.Draft) revert InvalidEventState();

        events[_eventId].state = EventState.OnSale;

        emit TicketSalesStarted(_eventId);
    }

    function buyCreditsWithEth() external payable {
        if (msg.value == 0) revert ZeroValue();

        uint256 creditsToMint = msg.value * ethToCreditsRate;
        creditsToken.mint(msg.sender, creditsToMint);

        emit CreditsPurchased(msg.sender, msg.value, creditsToMint);
    }

    function obtainTicketWithCredits(uint256 _eventId, uint256 _tierId) external returns (uint256 ticketId) {
        EventData storage eventData = events[_eventId];
        if (eventData.state != EventState.OnSale) revert InvalidEventState();

        TicketTier storage tier = ticketTiers[_eventId][_tierId];
        if (tier.maxSupply == 0) revert UnknownTier();
        if (walletPurchases[_eventId][msg.sender] >= eventData.walletCap) revert WalletCapExceeded();
        if (tier.soldCount >= tier.maxSupply) revert TierSoldOut();

        creditsToken.transferFrom(msg.sender, address(treasuryVault), tier.priceInCredits);
        treasuryVault.recordTicketSale(_eventId, tier.priceInCredits);

        ticketId = ticketNFT.mint(msg.sender, _eventId, _tierId);
        tier.soldCount += 1;
        walletPurchases[_eventId][msg.sender] += 1;

        if (tier.soldCount == tier.maxSupply) {
            eventData.state = EventState.SoldOut;
        }

        emit TicketObtained(_eventId, _tierId, ticketId, msg.sender, tier.priceInCredits);
    }
}
