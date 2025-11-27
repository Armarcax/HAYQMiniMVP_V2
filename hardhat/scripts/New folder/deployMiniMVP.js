const { ethers, upgrades } = require("hardhat");

async function main() {
  const Mini = await ethers.getContractFactory("HAYQMiniMVP");
  const mini = await upgrades.deployProxy(Mini, [ethers.parseEther("1000000")], { initializer: "initialize" });
  await mini.waitForDeployment();
  console.log(await mini.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
