import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("TicketNFT", function () {
  async function deployTicketFixture() {
    const [admin, platform, student, otherStudent] = await ethers.getSigners();

    const ticketNFT = await ethers.deployContract("TicketNFT", [admin.address]);

    return { admin, platform, student, otherStudent, ticketNFT };
  }

  describe("deployment and configuration", function () {
    it("sets NFT metadata, owner, admin, and the initial ticket counter", async function () {
      const { admin, ticketNFT } = await deployTicketFixture();

      expect(await ticketNFT.name()).to.equal("Campus Event Ticket");
      expect(await ticketNFT.symbol()).to.equal("CET");
      expect(await ticketNFT.owner()).to.equal(admin.address);
      expect(await ticketNFT.admin()).to.equal(admin.address);
      expect(await ticketNFT.platform()).to.equal(ethers.ZeroAddress);
      expect(await ticketNFT.nextTicketId()).to.equal(1n);
    });

    it("allows only the owner to set the platform and rejects the zero address", async function () {
      const { admin, platform, student, ticketNFT } = await deployTicketFixture();

      await expect(ticketNFT.connect(student).setPlatform(platform.address)).to.be.revertedWithCustomError(
        ticketNFT,
        "OwnableUnauthorizedAccount",
      );

      await expect(ticketNFT.connect(admin).setPlatform(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        ticketNFT,
        "ZeroAddress",
      );

      await expect(ticketNFT.connect(admin).setPlatform(platform.address))
        .to.emit(ticketNFT, "PlatformUpdated")
        .withArgs(platform.address);

      expect(await ticketNFT.platform()).to.equal(platform.address);
    });
  });

  describe("minting and ownership", function () {
    it("allows the configured platform to mint a ticket and records event, tier, and active state", async function () {
      const { admin, platform, student, ticketNFT } = await deployTicketFixture();

      await ticketNFT.connect(admin).setPlatform(platform.address);

      await expect(ticketNFT.connect(platform).mint(student.address, 7n, 2n))
        .to.emit(ticketNFT, "TicketMinted")
        .withArgs(1n, student.address, 7n, 2n)
        .and.to.emit(ticketNFT, "Transfer")
        .withArgs(ethers.ZeroAddress, student.address, 1n);

      expect(await ticketNFT.ownerOf(1n)).to.equal(student.address);
      expect(await ticketNFT.balanceOf(student.address)).to.equal(1n);
      expect(await ticketNFT.ticketEventIds(1n)).to.equal(7n);
      expect(await ticketNFT.ticketTierIds(1n)).to.equal(2n);
      expect(await ticketNFT.ticketStates(1n)).to.equal(0n);
      expect(await ticketNFT.nextTicketId()).to.equal(2n);
    });

    it("rejects minting from non-platform callers", async function () {
      const { admin, platform, student, ticketNFT } = await deployTicketFixture();

      await ticketNFT.connect(admin).setPlatform(platform.address);

      await expect(ticketNFT.connect(student).mint(student.address, 1n, 1n)).to.be.revertedWithCustomError(
        ticketNFT,
        "NotPlatform",
      );
    });
  });

  describe("ticket lifecycle", function () {
    it("allows the platform to move the ticket through valid lifecycle transitions", async function () {
      const { admin, platform, student, ticketNFT } = await deployTicketFixture();

      await ticketNFT.connect(admin).setPlatform(platform.address);
      await ticketNFT.connect(platform).mint(student.address, 1n, 1n);

      await expect(ticketNFT.connect(platform).markUsed(1n))
        .to.emit(ticketNFT, "TicketMarkedUsed")
        .withArgs(1n);

      expect(await ticketNFT.ticketStates(1n)).to.equal(3n);

      await ticketNFT.connect(platform).mint(student.address, 2n, 1n);

      await expect(ticketNFT.connect(platform).invalidate(2n))
        .to.emit(ticketNFT, "TicketInvalidated")
        .withArgs(2n);

      expect(await ticketNFT.ticketStates(2n)).to.equal(1n);

      await expect(ticketNFT.connect(platform).markRefunded(2n))
        .to.emit(ticketNFT, "TicketRefunded")
        .withArgs(2n);

      expect(await ticketNFT.ticketStates(2n)).to.equal(2n);
    });

    it("rejects invalid lifecycle transitions", async function () {
      const { admin, platform, student, ticketNFT } = await deployTicketFixture();

      await ticketNFT.connect(admin).setPlatform(platform.address);
      await ticketNFT.connect(platform).mint(student.address, 1n, 1n);

      await expect(ticketNFT.connect(platform).markRefunded(1n)).to.be.revertedWithCustomError(
        ticketNFT,
        "InvalidTicketState",
      );

      await ticketNFT.connect(platform).markUsed(1n);

      await expect(ticketNFT.connect(platform).invalidate(1n)).to.be.revertedWithCustomError(
        ticketNFT,
        "InvalidTicketState",
      );
    });
  });

  describe("non-transferability", function () {
    it("rejects transfers and approvals because tickets are intentionally non-transferable", async function () {
      const { admin, platform, student, otherStudent, ticketNFT } = await deployTicketFixture();

      await ticketNFT.connect(admin).setPlatform(platform.address);
      await ticketNFT.connect(platform).mint(student.address, 1n, 1n);

      await expect(ticketNFT.connect(student).approve(otherStudent.address, 1n)).to.be.revertedWithCustomError(
        ticketNFT,
        "NonTransferable",
      );

      await expect(
        ticketNFT.connect(student).setApprovalForAll(otherStudent.address, true),
      ).to.be.revertedWithCustomError(ticketNFT, "NonTransferable");

      await expect(
        ticketNFT.connect(student).transferFrom(student.address, otherStudent.address, 1n),
      ).to.be.revertedWithCustomError(ticketNFT, "NonTransferable");

      await expect(
        ticketNFT
          .connect(student)
          ["safeTransferFrom(address,address,uint256,bytes)"](student.address, otherStudent.address, 1n, "0x"),
      ).to.be.revertedWithCustomError(ticketNFT, "NonTransferable");
    });
  });
});
