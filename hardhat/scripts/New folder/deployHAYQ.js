const { ethers, upgrades } = require("hardhat");

async function main() {
  const args = process.argv.slice(2);
  const miniMVPAddress = args[0];

  if (!miniMVPAddress) throw new Error("❌ MiniMVP address required as argument");

  const HAYQ = await ethers.getContractFactory("HAYQ");
  const hayq = await upgrades.deployProxy(HAYQ, [miniMVPAddress], { initializer: "initialize" });
  await hayq.waitForDeployment();

  console.log(await hayq.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
