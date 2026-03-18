/**
 * Run with:
 * npx hardhat run scripts/01-buy-credits-tx-object.ts
 *
 * Purpose:
 * Print the transaction object for the manual CW1 transaction-anatomy evidence.
 */

import { runCreditPurchase } from "./cw1-video-shared.js";

const { tx } = await runCreditPurchase();

console.log(tx);
