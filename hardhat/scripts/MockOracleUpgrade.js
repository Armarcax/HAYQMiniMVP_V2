import pkg from "hardhat";
const { ethers, upgrades } = pkg;

async function main() {
  const MockOracle = await ethers.getContractFactory("MockOracleUpgradeable");
  const proxy = await upgrades.deployProxy(MockOracle, [], {
    initializer: "initialize",
  });

  await proxy.waitForDeployment();
  console.log("🚀 MockOracleUpgradeable deployed at:", await proxy.getAddress());
}

main().catch(console.error);
