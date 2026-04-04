# CW2 SPA

Clean boilerplate for the final Phase 6 rebuild.

## Scope

This folder is intentionally reset to a minimal starting point so the final UI can be rebuilt
iteratively from the Stitch-approved design direction and the Phase 6 checklist.

What remains in place:
- the React + TypeScript + Bulma setup
- the local deployment bridge at `scripts/deploy-spa-local.ts`
- the generated contract metadata path:
  - `src/config/contract-info.json`

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
- MetaMask should be connected to the local Hardhat chain before using the final rebuilt SPA.
- Use the local implementation checklist in:
  - `/Users/freemancodz/Desktop/Projects/Blockchain Development/implementation/deliverables/cw2/PHASE-6-SPA-FEATURE-CHECKLIST.md`
