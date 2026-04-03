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

## Unit conventions

- Native ETH sent into `buyCreditsWithEth()` is always handled by Solidity as `msg.value` in wei.
- CEC values are stored and passed as ERC-20 base units with 18 decimals.
- In tests and future SPA inputs, use `ethers.parseEther(...)` for ETH and `ethers.parseUnits(..., 18)` for CEC amounts.
- `priceInCredits` means CEC base units, not human-readable whole tokens.
- There is no SPA in this folder yet, so this convention is the rule for any future UI layer that is added under `implementation/project`.

## Commands

```bash
npx hardhat compile
npx hardhat test
```
