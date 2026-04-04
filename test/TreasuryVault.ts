import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("TreasuryVault", function () {
  async function deployTreasuryFixture() {
    const [admin, platform, user] = await ethers.getSigners();

    const treasuryVault = await ethers.deployContract("TreasuryVault", [admin.address]);

    return { admin, platform, user, treasuryVault };
  }

  describe("deployment and configuration", function () {
    it("sets owner, admin, and zeroed accounting state", async function () {
      const { admin, treasuryVault } = await deployTreasuryFixture();

      expect(await treasuryVault.owner()).to.equal(admin.address);
      expect(await treasuryVault.admin()).to.equal(admin.address);
      expect(await treasuryVault.platform()).to.equal(ethers.ZeroAddress);
      expect(await treasuryVault.paidCreditsByEvent(1n)).to.equal(0n);
      expect(await treasuryVault.refundCreditsByEvent(1n)).to.equal(0n);
    });

    it("allows only the owner to set the platform and rejects the zero address", async function () {
      const { admin, platform, user, treasuryVault } = await deployTreasuryFixture();

      await expect(treasuryVault.connect(user).setPlatform(platform.address)).to.be.revertedWithCustomError(
        treasuryVault,
        "OwnableUnauthorizedAccount",
      );

      await expect(treasuryVault.connect(admin).setPlatform(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        treasuryVault,
        "ZeroAddress",
      );

      await expect(treasuryVault.connect(admin).setPlatform(platform.address))
        .to.emit(treasuryVault, "PlatformUpdated")
        .withArgs(platform.address);

      expect(await treasuryVault.platform()).to.equal(platform.address);
    });
  });

  describe("platform-controlled accounting", function () {
    it("records ticket-sale totals for an event", async function () {
      const { admin, platform, treasuryVault } = await deployTreasuryFixture();
      const firstAmount = ethers.parseUnits("200", 18);
      const secondAmount = ethers.parseUnits("100", 18);

      await treasuryVault.connect(admin).setPlatform(platform.address);

      await expect(treasuryVault.connect(platform).recordTicketSale(1n, firstAmount))
        .to.emit(treasuryVault, "TicketSaleRecorded")
        .withArgs(1n, firstAmount);

      await treasuryVault.connect(platform).recordTicketSale(1n, secondAmount);

      expect(await treasuryVault.paidCreditsByEvent(1n)).to.equal(firstAmount + secondAmount);
    });

    it("records refund totals for an event", async function () {
      const { admin, platform, treasuryVault } = await deployTreasuryFixture();
      const refundAmount = ethers.parseUnits("50", 18);

      await treasuryVault.connect(admin).setPlatform(platform.address);

      await expect(treasuryVault.connect(platform).recordRefund(1n, refundAmount))
        .to.emit(treasuryVault, "RefundRecorded")
        .withArgs(1n, refundAmount);

      expect(await treasuryVault.refundCreditsByEvent(1n)).to.equal(refundAmount);
    });

    it("rejects accounting writes from non-platform callers", async function () {
      const { admin, platform, user, treasuryVault } = await deployTreasuryFixture();
      const amount = ethers.parseUnits("10", 18);

      await treasuryVault.connect(admin).setPlatform(platform.address);

      await expect(treasuryVault.connect(user).recordTicketSale(1n, amount)).to.be.revertedWithCustomError(
        treasuryVault,
        "NotPlatform",
      );

      await expect(treasuryVault.connect(user).recordRefund(1n, amount)).to.be.revertedWithCustomError(
        treasuryVault,
        "NotPlatform",
      );
    });
  });
});
