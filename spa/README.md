# CW2 SPA

Minimal React + Bulma interface for the CW2 local Hardhat flow.

## Scope

This SPA currently demonstrates one real on-chain action:
- connect a wallet
- call `buyCreditsWithEth()`
- show before/after CEC balance
- show transaction evidence:
  - tx hash
  - receipt status
  - block number
  - gas used
  - emitted log count

## Local run order

From the Hardhat project root:

```bash
npx hardhat node
```

In a second terminal:

```bash
npx hardhat run --network localhost scripts/deploy-spa-local.ts
```

Then inside `spa/`:

```bash
npm install
npm run dev
```

## Notes

- The deployment script writes `src/config/contract-info.json`.
- MetaMask should be connected to the local Hardhat chain before using the SPA.
- The current UI is intentionally limited to the ERC-20 exchange flow so the CW2 demo stays focused.
