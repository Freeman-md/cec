# Campus Event Credits & Ticketing dApp

> A full-stack Ethereum dApp built on Hardhat that implements an ERC-20 campus credits token, non-transferable ERC-721 event tickets, per-event treasury accounting, and a role-gated platform contract — paired with a React + ethers.js SPA for end-to-end interaction.

## Project Metadata
- Type: project
- Domain: Blockchain / Smart Contracts / Web3 Frontend
- Status: Active
- Level: Intermediate–Advanced
- Year: 2026
- Featured: false
- Repository URL: Not public
- Live URL: Not deployed
- Thumbnail URL:

## Summary

This repository implements a campus event ticketing system on a local Hardhat EVM. The on-chain layer consists of four Solidity contracts: `CreditsToken` (ERC-20, platform-minted), `TicketNFT` (ERC-721, non-transferable), `TreasuryVault` (per-event credit accounting), and `EventPlatform` (the coordinating contract that wires the others together). The frontend is a React + Vite SPA using ethers.js v6 and Bulma CSS, featuring wallet connection, role detection (admin/organizer/student), credit purchase, ticket purchase with ERC-20 allowance flow, organizer event management, and an admin console. A local deployment script writes contract ABIs and addresses to `spa/src/config/contract-info.json` for use by the SPA.

## Tech Stack

**Smart contracts:** Solidity 0.8.28, OpenZeppelin Contracts v5 (ERC-20, ERC-721, Ownable)  
**Development environment:** Hardhat 3, `@nomicfoundation/hardhat-toolbox-mocha-ethers`, TypeScript 5.8, Hardhat EDR simulated networks  
**Testing:** Mocha 11, Chai 6, ethers.js v6 via `@nomicfoundation/hardhat-ethers`  
**Frontend:** React 19, Vite 7, ethers.js v6, Bulma 1.0, React Router 7, TypeScript 5.8

## Problem / Context

Campus events typically use centralized ticketing platforms with no on-chain ownership guarantees, allowing secondary resale and ticket fraud. This project explores enforcing ticket non-transferability and per-wallet purchase caps directly in smart contract logic, using an ERC-20 credits token as the payment medium rather than raw ETH for ticket purchases.

## System Snapshot

### Core System Idea

A platform-gated EVM system where a single `EventPlatform` contract orchestrates credit minting, ticket issuance, and treasury recording — with a React SPA providing a complete user interface over a local Hardhat node.

### Main Components

1. **`CreditsToken`** — ERC-20 with 18 decimals, symbol `CEC`. Only the registered platform address can mint or burn. The admin sets the platform address via `setPlatform`. Users acquire CEC by sending ETH to `EventPlatform.buyCreditsWithEth()`, which mints at the configured `ethToCreditsRate`.

2. **`TicketNFT`** — ERC-721 with `approve`, `setApprovalForAll`, `transferFrom`, and `safeTransferFrom` all overridden to revert with `NonTransferable`. Tickets track state (`Active`, `Invalidated`, `Refunded`, `Used`), event ID, and tier ID. Only the platform can mint, invalidate, mark used, or mark refunded.

3. **`TreasuryVault`** — Records cumulative paid and refunded CEC amounts per event ID via `paidCreditsByEvent` and `refundCreditsByEvent` mappings. Only the platform can write. Provides a verifiable on-chain financial record per event.

4. **`EventPlatform`** — Central orchestrator. Admin approves organizers; organizers create events (Draft → OnSale → SoldOut), configure ticket tiers (label, CEC price, max supply), set per-event wallet caps, and start sales. Students buy CEC with ETH, approve the platform for ERC-20 spend, then call `obtainTicketWithCredits` to receive a `TicketNFT`.

5. **React SPA (`spa/`)** — Role-aware frontend with pages for event discovery, credit purchase, ticket purchase (with approval flow), organizer studio (create event, add tiers, set wallet cap, start sales), admin console (approve organizers, update exchange rate), wallet dashboard, and a ticket inventory. Contract addresses and ABIs are injected at deploy time via `scripts/deploy-spa-local.ts`.

6. **Test suite** — Five test files covering `CreditsToken`, `TicketNFT`, `TreasuryVault`, `EventPlatform`, `SecurityMisuse`, and an end-to-end scaffold test. Tests validate happy paths, access control rejections, state machine transitions, and ticket non-transferability misuse scenarios.

## Design Focus

- **Non-transferable ERC-721**: All transfer and approval functions are overridden to revert with a `NonTransferable` custom error, enforcing soulbound ticket semantics at the contract level rather than relying on off-chain policy.
- **Platform-gated minting**: Neither `CreditsToken` nor `TicketNFT` can be minted externally — both require the caller to be the registered `EventPlatform` address, set post-deployment by the admin.
- **Event state machine**: Events progress through `Draft → OnSale → SoldOut` (or `Cancelled / Completed`) with guard checks in each mutating function — tier configuration and wallet cap changes are blocked once the event leaves Draft.
- **CEC unit discipline**: All credit values are ERC-20 base units (18 decimals). ETH sent to `buyCreditsWithEth` is multiplied by `ethToCreditsRate` to produce CEC base units directly; the SPA uses `parseEther` and `parseUnits` throughout to avoid unit confusion.
- **Contract info injection**: `scripts/deploy-spa-local.ts` writes deployed addresses and parsed ABIs to `spa/src/config/contract-info.json`, giving the SPA a single source of truth without hardcoding addresses.

## Core Innovation

The combination of an ERC-20 credits economy with non-transferable ERC-721 tickets in a single coordinating platform contract creates a closed-loop ticketing system: credits can only be spent on tickets, tickets cannot leave the purchasing wallet, and the treasury records every CEC flow per event. This makes both the credit economy and ticket ownership fully auditable on-chain without any off-chain database.

## Implementation

**Local development flow:**

```bash
npx hardhat node
npx hardhat run --network localhost scripts/deploy-spa-local.ts
cd spa && npm install && npm run dev
```

**Testing:**

```bash
npx hardhat compile
npx hardhat test
```

**Deployment setup:** `deploy-spa-local.ts` deploys all four contracts, wires platform addresses, approves a test organizer account, creates a demo event with two tiers (General Admission at 150 CEC, VIP Obsidian Pass at 450 CEC), sets a wallet cap of 1, and starts sales. It then serializes all ABIs and addresses to `spa/src/config/contract-info.json`.

**Role detection:** The SPA detects the connected wallet's role by reading `eventPlatform.admin()` (admin role) and `eventPlatform.approvedOrganizers(account)` (organizer role) on every wallet connection or network change.

**Ticket purchase flow:** The SPA checks the CEC allowance granted to `EventPlatform` before presenting a purchase button. If allowance is insufficient, it presents an "Approve CEC" action first, then "Purchase Selected Ticket" once approved — reflecting the two-transaction ERC-20 approval pattern.

## Performance / Operational Profile

### Latency Profile
- Title: Local Hardhat node, instant finality
- Description: All transactions confirm in the same block on the local EDR-simulated network. No real block times apply; the bottleneck is the React state refresh cycle after each transaction receipt.

### System Focus
- Title: Correctness and access control over gas optimization
- Description: The contracts use the Hardhat default profile (no optimizer) for CW1 feasibility. Custom errors replace string reverts throughout, reducing deployment cost and improving revert clarity. The production Hardhat profile enables the optimizer at 200 runs.

## Outcomes

The contract suite enforces ticket non-transferability, per-wallet purchase caps, and CEC-denominated pricing entirely on-chain. The SPA provides a complete interaction layer covering all four user roles (unconnected visitor, student, organizer, admin) with live on-chain state reads, two-step purchase flows, and transaction evidence panels that display hash, receipt status, block number, gas used, and balance changes for each confirmed transaction.

## Why This Matters

This project demonstrates how standard OpenZeppelin primitives (ERC-20, ERC-721, Ownable) can be composed into a domain-specific system with non-standard behavior — specifically making NFTs intentionally soulbound — without requiring custom base contracts. The role-detection and event state machine patterns are directly applicable to any gated on-chain access system.

## Future Improvements

- **Payout release**: `EventData.payoutReleased` is tracked in storage but `TreasuryVault` has no ETH withdrawal function — a payout mechanism for organizers is a natural next step.
- **Auth guard execution model**: The SPA detects the admin address and organizer status only on connect; real-time re-detection on block events would prevent stale role state after admin changes.
- **Refund flow**: `TicketNFT` supports `Invalidated → Refunded` transitions and `TreasuryVault` tracks `refundCreditsByEvent`, but no `EventPlatform` function triggers this flow yet — a full cancellation and refund path is a documented future phase.
- **Sepolia deployment**: `hardhat.config.ts` includes a Sepolia network configuration with `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY` config variables — public testnet deployment is structurally ready but not yet scripted.
