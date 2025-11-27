const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HAYQ integrated flow (local)", function () {
  let deployer, alice, bob;
  beforeEach(async () => {
    [deployer, alice, bob] = await ethers.getSigners();
  });

  it("deploys whole stack, wires modules and runs basic flows", async function () {
    // 1) Deploy mocks
    const MockOracle = await ethers.getContractFactory("MockOracle");
    const oracle = await MockOracle.deploy(1000);
    await oracle.deployed();

    const MockRouter = await ethers.getContractFactory("MockRouter");
    const router = await MockRouter.deploy();
    await router.deployed();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    // Deploy a reward token (used by dividend tracker)
    const reward = await upgrades.deployProxy(MockERC20, ["Reward", "RWD", ethers.parseUnits("1000000", 18)], { initializer: "initialize" });
    await reward.waitForDeployment();

    // 2) Deploy HAYQ proxy with zero placeholders (we'll set modules after)
    const HAYQ = await ethers.getContractFactory("HAYQ");
    const hayq = await upgrades.deployProxy(HAYQ, [ethers.constants.AddressZero, ethers.constants.AddressZero, ethers.constants.AddressZero, ethers.constants.AddressZero], { initializer: "initialize" });
    await hayq.waitForDeployment();

    // 3) Deploy VestingVault with placeholder token (use reward token for now), then set token to HAYQ later
    const VestingVault = await ethers.getContractFactory("VestingVault");
    const vesting = await VestingVault.deploy(reward.target || reward.address);
    await vesting.deployed();

    // 4) Deploy DividendTracker (upgradeable) but pass reward token and placeholder hayq (will set real hayq later)
    const Dividend = await ethers.getContractFactory("Erc20DividendTrackerUpgradeable");
    const dividend = await upgrades.deployProxy(Dividend, [reward.target || reward.address, ethers.constants.AddressZero], { initializer: "initialize" });
    await dividend.waitForDeployment();

    // 5) Now set the real module addresses on HAYQ
    await hayq.setRouter(router.address);
    await hayq.setOracle(oracle.address);
    await hayq.setVestingVault(vesting.address);
    await hayq.setDividendTracker(dividend.target || dividend.address);

    // 6) Now fix VestingVault.token to be HAYQ token and set HAYQ on vesting vault
    // NOTE: we added setToken/setHAYQ — ensure owner is deployer (default)
    if (vesting.setToken) {
      await vesting.setToken(hayq.target || hayq.address);
    }
    if (vesting.setHAYQ) {
      await vesting.setHAYQ(hayq.target || hayq.address);
    }

    // 7) Set hayqToken inside dividend tracker (we added setHayqToken)
    if (dividend.setHayqToken) {
      await dividend.setHayqToken(hayq.target || hayq.address);
    }

    // 8) Give some HAYQ to Alice (mint by owner)
    const mintAmount = ethers.parseUnits("1000", 18);
    await hayq.mint(alice.address, mintAmount);

    const aliceBal = await hayq.balanceOf(alice.address);
    expect(aliceBal).to.equal(mintAmount);

    // 9) Alice stakes 200
    await hayq.connect(alice).approve(hayq.address, ethers.parseUnits("1000", 18)).catch(()=>{});
    await hayq.connect(alice).stake(ethers.parseUnits("200", 18));
    const staked = await hayq.staked(alice.address);
    expect(staked).to.equal(ethers.parseUnits("200", 18));

    // 10) Alice locks 100 tokens for vesting (start now, 1 day)
    const now = Math.floor(Date.now() / 1000);
    await hayq.connect(alice).lockTokens(ethers.parseUnits("100", 18), now, 86400);

    // 11) Owner distributes 50 reward tokens as dividends: first approve dividend contract
    // Transfer some reward tokens to deployer to simulate treasury
    await reward.connect(deployer).mint(deployer.address, ethers.parseUnits("10000", 18)).catch(()=>{});
    await reward.connect(deployer).approve(dividend.target || dividend.address, ethers.parseUnits("10000", 18));
    await dividend.connect(deployer).distributeDividends(ethers.parseUnits("50", 18));

    // 12) Alice withdraws dividend
    // Alice should have withdrawable > 0 (balance proportion)
    const withdrawable = await dividend.withdrawableDividendOf(alice.address);
    expect(withdrawable).to.be.gt(0);
    await dividend.connect(alice).withdrawDividend();
    const withdrawn = await dividend.withdrawnDividends(alice.address);
    expect(withdrawn).to.be.gt(0);

    // 13) Oracle price read
    const price = await hayq.getLatestPrice();
    expect(price).to.equal(1000);

    // 14) Buyback (simulate): owner approves HAYQ tokens to router by first transferring some tokens to this contract and call buyback
    const buybackAmount = ethers.parseUnits("10", 18);
    // transfer hayq tokens to HAYQ contract for buyback demonstration
    await hayq.transfer(hayq.target || hayq.address, buybackAmount);
    // call buyback with tokenOut = reward.address (mock)
    await hayq.buyback(buybackAmount, ethers.parseUnits("1", 18), reward.target || reward.address);

    // If we reach here, basic flows pass
  });
});
