/**
 * Run with:
 * npx hardhat run scripts/03-buy-credits-state-change.ts
 *
 * Purpose:
 * Print the decoded platform event and the final student credit balance
 * for the manual CW1 transaction-anatomy evidence.
 */

import { runCreditPurchase } from "./cw1-video-shared.js";

const { creditsToken, eventPlatform, receipt, student } = await runCreditPurchase();

console.log("eventPlatform.interface.parseLog(receipt.logs[2])");
console.log(eventPlatform.interface.parseLog(receipt.logs[2]));
console.log("");

console.log("await creditsToken.balanceOf(student.address)");
console.log(await creditsToken.balanceOf(student.address));
console.log("");

console.log("student.address");
console.log(student.address);
