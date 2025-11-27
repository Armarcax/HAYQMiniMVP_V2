// scripts/deploy.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy MockRouter
  const MockRouter = await ethers.getContractFactory("MockRouter");
  const mockRouter = await MockRouter.deploy();
  await mockRouter.waitForDeployment();
  console.log("MockRouter deployed to:", mockRouter.target);

  // 2. Deploy HAYQMiniMVP
  const MiniMVP = await ethers.getContractFactory("HAYQMiniMVP");
  const miniMVP = await MiniMVP.deploy();
  await miniMVP.waitForDeployment();
  console.log("HAYQMiniMVP deployed to:", miniMVP.target);

  // 3. Deploy HAYQ as UUPS proxy
  const HAYQ = await ethers.getContractFactory("HAYQ");
  const hayq = await upgrades.deployProxy(HAYQ, [mockRouter.target, miniMVP.target], {
    initializer: "initialize",
  });
  await hayq.waitForDeployment();
  console.log("✅ HAYQ (Proxy) deployed to:", hayq.target);

  // 4. Ստուգել սկզբնական հաշվեհամարը
  const balance = await hayq.balanceOf(deployer.address);
  console.log("Deployer HAYQ balance:", ethers.formatUnits(balance, 18));
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});