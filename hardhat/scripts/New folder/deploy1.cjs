const { ethers, upgrades } = require("hardhat");
const { parseUnits, formatUnits } = require("ethers");

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // --- Deploy MockRouter ---
  const MockRouter = await ethers.getContractFactory("MockRouter");
  const mockRouter = await MockRouter.deploy();
  await mockRouter.deployed();
  console.log("MockRouter deployed to:", mockRouter.address);

  // --- Deploy HAYQMiniMVP (NOT MockOracle!) ---
  const MiniMVP = await ethers.getContractFactory("HAYQMiniMVP");
  const miniMVP = await MiniMVP.deploy();
  await miniMVP.deployed();
  console.log("HAYQMiniMVP deployed to:", miniMVP.address);

  // --- Deploy HAYQ as a PROXY ---
  const HAYQ = await ethers.getContractFactory("HAYQ");
  const hayq = await upgrades.deployProxy(HAYQ, [mockRouter.address, miniMVP.address], {
    initializer: "initialize",
  });
  await hayq.deployed();
  console.log("HAYQ (Proxy) deployed to:", hayq.address);

  // --- Mint extra HAYQ to users (ONLY if you added a public mint function for testing) ---
  // ⚠️ Ձեր ներկայիս HAYQ.sol-ում չկա հանրային `mint` ֆունկցիա!
  // Ուստի հետևյալ տողերը կարող են ձախողվել:
  /*
  console.log("Minting 1000 HAYQ to user1 and user2...");
  await hayq.mint(user1.address, parseUnits("1000", 18));
  await hayq.mint(user2.address, parseUnits("1000", 18));
  */

  // Փոխարենը, կարող եք ստուգել միայն deployer-ի հաշվեհամարը:
  const deployerBalance = await hayq.balanceOf(deployer.address);
  console.log("Deployer HAYQ balance:", formatUnits(deployerBalance, 18));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});