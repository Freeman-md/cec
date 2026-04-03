import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("CreditsToken", function () {
  async function deployTokenFixture() {
    const [admin, platform, alice, bob] = await ethers.getSigners();

    const creditsToken = await ethers.deployContract("CreditsToken", [admin.address]);

    return { admin, platform, alice, bob, creditsToken };
  }

  it("sets token metadata, owner, admin, and zero initial supply", async function () {
    const { admin, creditsToken } = await deployTokenFixture();

    expect(await creditsToken.name()).to.equal("Campus Event Credits");
    expect(await creditsToken.symbol()).to.equal("CEC");
    expect(await creditsToken.decimals()).to.equal(18n);
    expect(await creditsToken.totalSupply()).to.equal(0n);
    expect(await creditsToken.owner()).to.equal(admin.address);
    expect(await creditsToken.admin()).to.equal(admin.address);
    expect(await creditsToken.platform()).to.equal(ethers.ZeroAddress);
  });

  it("allows only the owner to set the platform and rejects the zero address", async function () {
    const { admin, platform, alice, creditsToken } = await deployTokenFixture();

    await expect(creditsToken.connect(alice).setPlatform(platform.address)).to.be.revertedWithCustomError(
      creditsToken,
      "OwnableUnauthorizedAccount",
    );

    await expect(creditsToken.connect(admin).setPlatform(ethers.ZeroAddress)).to.be.revertedWithCustomError(
      creditsToken,
      "ZeroAddress",
    );

    await expect(creditsToken.connect(admin).setPlatform(platform.address))
      .to.emit(creditsToken, "PlatformUpdated")
      .withArgs(platform.address);

    expect(await creditsToken.platform()).to.equal(platform.address);
  });

  it("allows the configured platform to mint credits and emits the expected events", async function () {
    const { admin, platform, alice, creditsToken } = await deployTokenFixture();
    const mintAmount = ethers.parseUnits("100", 18);

    await creditsToken.connect(admin).setPlatform(platform.address);

    await expect(creditsToken.connect(platform).mint(alice.address, mintAmount))
      .to.emit(creditsToken, "CreditsMinted")
      .withArgs(alice.address, mintAmount)
      .and.to.emit(creditsToken, "Transfer")
      .withArgs(ethers.ZeroAddress, alice.address, mintAmount);

    expect(await creditsToken.balanceOf(alice.address)).to.equal(mintAmount);
    expect(await creditsToken.totalSupply()).to.equal(mintAmount);
  });

  it("rejects minting from non-platform callers", async function () {
    const { admin, platform, alice, bob, creditsToken } = await deployTokenFixture();
    const mintAmount = ethers.parseUnits("10", 18);

    await creditsToken.connect(admin).setPlatform(platform.address);

    await expect(creditsToken.connect(bob).mint(alice.address, mintAmount)).to.be.revertedWithCustomError(
      creditsToken,
      "NotPlatform",
    );
  });

  it("supports direct ERC20 transfers between token holders", async function () {
    const { admin, platform, alice, bob, creditsToken } = await deployTokenFixture();
    const mintAmount = ethers.parseUnits("100", 18);
    const transferAmount = ethers.parseUnits("25", 18);

    await creditsToken.connect(admin).setPlatform(platform.address);
    await creditsToken.connect(platform).mint(alice.address, mintAmount);

    await expect(creditsToken.connect(alice).transfer(bob.address, transferAmount))
      .to.emit(creditsToken, "Transfer")
      .withArgs(alice.address, bob.address, transferAmount);

    expect(await creditsToken.balanceOf(alice.address)).to.equal(mintAmount - transferAmount);
    expect(await creditsToken.balanceOf(bob.address)).to.equal(transferAmount);
  });

  it("supports allowance approval and transferFrom using 18-decimal base units", async function () {
    const { admin, platform, alice, bob, creditsToken } = await deployTokenFixture();
    const mintAmount = ethers.parseUnits("100", 18);
    const approvedAmount = ethers.parseUnits("40", 18);
    const transferAmount = ethers.parseUnits("30", 18);

    await creditsToken.connect(admin).setPlatform(platform.address);
    await creditsToken.connect(platform).mint(alice.address, mintAmount);

    await expect(creditsToken.connect(alice).approve(bob.address, approvedAmount))
      .to.emit(creditsToken, "Approval")
      .withArgs(alice.address, bob.address, approvedAmount);

    expect(await creditsToken.allowance(alice.address, bob.address)).to.equal(approvedAmount);

    await expect(creditsToken.connect(bob).transferFrom(alice.address, admin.address, transferAmount))
      .to.emit(creditsToken, "Transfer")
      .withArgs(alice.address, admin.address, transferAmount);

    expect(await creditsToken.balanceOf(admin.address)).to.equal(transferAmount);
    expect(await creditsToken.balanceOf(alice.address)).to.equal(mintAmount - transferAmount);
    expect(await creditsToken.allowance(alice.address, bob.address)).to.equal(approvedAmount - transferAmount);
  });

  it("allows the configured platform to burn credits and reduce total supply", async function () {
    const { admin, platform, alice, creditsToken } = await deployTokenFixture();
    const mintAmount = ethers.parseUnits("100", 18);
    const burnAmount = ethers.parseUnits("20", 18);

    await creditsToken.connect(admin).setPlatform(platform.address);
    await creditsToken.connect(platform).mint(alice.address, mintAmount);

    await expect(creditsToken.connect(platform).burn(alice.address, burnAmount))
      .to.emit(creditsToken, "CreditsBurned")
      .withArgs(alice.address, burnAmount)
      .and.to.emit(creditsToken, "Transfer")
      .withArgs(alice.address, ethers.ZeroAddress, burnAmount);

    expect(await creditsToken.balanceOf(alice.address)).to.equal(mintAmount - burnAmount);
    expect(await creditsToken.totalSupply()).to.equal(mintAmount - burnAmount);
  });
});
