const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HAYQ MVP Contract Tests", function () {
  let hayq;
  let accounts;

  before(async function () {
    accounts = await ethers.getSigners();
    const HAYQ = await ethers.getContractFactory("HAYQ");
    hayq = await upgrades.deployProxy(HAYQ, ["HAYQ", "HQ"], { initializer: "initialize", kind: "uups" });
    await hayq.deployed();
  });

  it("Should deploy HAYQ correctly", async function () {
    expect(ethers.isAddress(hayq.address)).to.be.true;
  });

  it("Should have correct name and symbol", async function () {
    expect(await hayq.name()).to.equal("HAYQ");
    expect(await hayq.symbol()).to.equal("HQ");
  });

  it("Should process basic transfer correctly", async function () {
    const [owner, addr1] = accounts;
    await hayq.transfer(addr1.address, ethers.parseEther("10"));
    const balance = await hayq.balanceOf(addr1.address);
    expect(balance).to.equal(ethers.parseEther("10"));
  });

  it("Should allow staking and unstaking", async function () {
    const [owner, addr1] = accounts;
    // Մինչև stake անելը, ensure user has tokens
    await hayq.mint(addr1.address, ethers.parseEther("10"));
    await hayq.connect(addr1).stake(ethers.parseEther("5"));
    expect(await hayq.staked(addr1.address)).to.equal(ethers.parseEther("5"));
    await hayq.connect(addr1).unstake(ethers.parseEther("2"));
    expect(await hayq.staked(addr1.address)).to.equal(ethers.parseEther("3"));
  });

  it("Should fetch latest price from oracle", async function () {
    const price = await hayq.getLatestPrice();
    expect(price).to.be.a("bigint"); // price is int256 in Solidity
  });

  it("Should allow snapshots", async function () {
    const tx = await hayq.snapshot();
    await tx.wait();
    // Snapshot ID should increment (ERC20Snapshot starts at 1)
    const latestSnapshotId = await hayq.totalSupplyAt(await hayq.getCurrentSnapshotId());
    expect(latestSnapshotId).to.be.a("bigint");
  });
});
