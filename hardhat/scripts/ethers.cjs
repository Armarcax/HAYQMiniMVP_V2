const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HAYQ MVP Full Flow Tests", function () {
  let deployer, user1, user2, user3;
  let HAYQ, Vault;

  const DECIMALS = 18;
  const ONE_TOKEN = ethers.parseUnits("1", DECIMALS);

  before(async function () {
    [deployer, user1, user2, user3] = await ethers.getSigners();

    // Contracts
    const HAYQFactory = await ethers.getContractFactory("HAYQMiniMVP");
    HAYQ = await HAYQFactory.deploy();
    await HAYQ.deployed();

    const VaultFactory = await ethers.getContractFactory("VestingVaultUpgradeable");
    Vault = await VaultFactory.deploy();
    await Vault.deployed();

    // Fund Vault
    await HAYQ.mint(Vault.target, ethers.parseUnits("1000", DECIMALS));
  });

  describe("Owner-only functions", function () {
    it("should allow owner to create vesting", async function () {
      const amount = ethers.parseUnits("100", DECIMALS);
      await expect(Vault.connect(deployer).createVesting(user1.address, amount, 0, 3600))
        .to.emit(Vault, "VestingCreated")
        .withArgs(user1.address, amount, 0, 3600);
    });

    it("should revert for non-owner", async function () {
      const amount = ethers.parseUnits("100", DECIMALS);
      await expect(Vault.connect(user1).createVesting(user2.address, amount, 0, 3600))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Vesting / Batch Vesting", function () {
    it("should allow batch vesting creation and skip already vested", async function () {
      const beneficiaries = [user1.address, user2.address, user3.address];
      const amounts = [50, 50, 50].map(n => ethers.parseUnits(n.toString(), DECIMALS));
      const start = Math.floor(Date.now() / 1000);

      for (let i = 0; i < beneficiaries.length; i++) {
        try {
          await Vault.connect(deployer).createVesting(beneficiaries[i], amounts[i], start, 3600);
        } catch (err) {
          expect(err.message).to.include("Already vested");
        }
      }
    });
  });

  describe("Stake / Unstake / Rewards", function () {
    // TODO: Staking tests (approve, stake, unstake, rewards)
  });

  describe("Vault balance / ERC20 interaction", function () {
    it("should track correct balances after vesting", async function () {
      const vaultBalance = await HAYQ.balanceOf(Vault.target);
      expect(vaultBalance).to.equal(ethers.parseUnits("1000", DECIMALS).sub(ethers.parseUnits("100", DECIMALS)));
    });
  });

  describe("Edge Cases / Failures", function () {
    it("should revert on zero address", async function () {
      const amount = ethers.parseUnits("10", DECIMALS);
      await expect(Vault.connect(deployer).createVesting(ethers.ZeroAddress, amount, 0, 3600))
        .to.be.revertedWith("invalid address");
    });
  });
});
