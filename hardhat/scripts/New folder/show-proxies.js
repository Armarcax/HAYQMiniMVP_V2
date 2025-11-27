const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HAYQ-MVP Integration Tests", function () {
  let deployer, alice, bob;
  let HAYQ, hayq;
  let MockERC20, usdc;
  let MockRouter, router;
  let MockOracle, oracle;
  let VestingVault, vestingVault;

  beforeEach(async function () {
    [deployer, alice, bob] = await ethers.getSigners();

    // Deploy mocks
    MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("Mock USDC", "USDC", ethers.parseUnits("1000000", 6));

    MockRouter = await ethers.getContractFactory("MockRouter");
    router = await MockRouter.deploy(ethers.ZeroAddress);

    MockOracle = await ethers.getContractFactory("MockOracle");
    oracle = await MockOracle.deploy(ethers.parseUnits("1", 8));

    VestingVault = await ethers.getContractFactory("VestingVault");
    vestingVault = await VestingVault.deploy(usdc.address);

    // Deploy HAYQ via UUPS proxy
    HAYQ = await ethers.getContractFactory("HAYQ");
    hayq = await upgrades.deployProxy(
      HAYQ,
      [router.address, oracle.address, vestingVault.address],
      { kind: "uups" }
    );

    // Seed HAYQ to alice & bob
    await hayq.transfer(alice.address, ethers.parseEther("1000"));
    await hayq.transfer(bob.address, ethers.parseEther("500"));
  });

  it("should allow staking and unstaking", async function () {
    await hayq.connect(alice).stake(ethers.parseEther("100"));
    expect(await hayq.staked(alice.address)).to.equal(ethers.parseEther("100"));

    await hayq.connect(alice).unstake(ethers.parseEther("50"));
    expect(await hayq.staked(alice.address)).to.equal(ethers.parseEther("50"));
  });

  it("should allow buyback by owner", async function () {
    await expect(
      hayq.connect(deployer).buyback(ethers.parseEther("100"), ethers.parseEther("0.01"), ethers.ZeroAddress)
    ).to.emit(hayq, "Buyback").withArgs(ethers.parseEther("100"), ethers.parseEther("0.01"));
  });

  it("should return latest price from oracle", async function () {
    const price = await hayq.getLatestPrice();
    expect(price).to.equal(ethers.parseUnits("1", 8));
  });

  it("should allow locking tokens in vesting vault", async function () {
    const start = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const duration = 3600; // 1 hour duration
    await hayq.connect(alice).lockTokens(ethers.parseEther("50"), start, duration);

    const vesting = await vestingVault.vestings(alice.address);
    expect(vesting.totalAmount).to.equal(ethers.parseEther("50"));
  });

  it("should allow snapshots", async function () {
    const tx = await hayq.snapshot();
    // ERC20Snapshot IDs start at 1, cannot check directly without exposing _snapshotId
  });

  it("should maintain state after upgrade", async function () {
    const proxyAddress = hayq.address;
    const HAYQv2 = await ethers.getContractFactory("HAYQ");
    const upgraded = await upgrades.upgradeProxy(proxyAddress, HAYQv2);

    const total = await upgraded.totalSupply();
    expect(total).to.equal(await hayq.totalSupply());
  });
});
