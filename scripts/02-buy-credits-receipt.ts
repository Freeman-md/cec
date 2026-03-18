/**
 * Run with:
 * npx hardhat run scripts/02-buy-credits-receipt.ts
 *
 * Purpose:
 * Print the receipt status, gas used, log count, and emitted logs
 * for the manual CW1 transaction-anatomy evidence.
 */

import { runCreditPurchase } from "./cw1-video-shared.js";

const { receipt } = await runCreditPurchase();

console.log("receipt.status");
console.log(receipt.status);
console.log("");

console.log("receipt.gasUsed");
console.log(receipt.gasUsed);
console.log("");

console.log("receipt.logs.length");
console.log(receipt.logs.length);
console.log("");

console.log("receipt.logs");
console.log(receipt.logs);
