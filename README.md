# CST4125 Blockchain Development

Hardhat project for the CW1/CW2 campus event credits and ticketing coursework.

## Current stage

- base Hardhat scaffold initialized
- sample `Counter` contract/module removed
- coursework scaffold contracts are in place for the CW1 feasibility build

## Current contract set

- `CreditsToken`
  - ERC-20 platform credits
- `TicketNFT`
  - ERC-721 non-transferable tickets
- `TreasuryVault`
  - event-level paid/refund accounting
- `EventPlatform`
  - organizer approval, event setup, credit purchase, and ticket purchase flow

## Commands

```bash
npx hardhat compile
npx hardhat test
```
