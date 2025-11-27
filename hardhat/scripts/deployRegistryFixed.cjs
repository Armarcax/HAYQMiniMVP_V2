const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying RegistryUpgradeable...");

  const RegistryUpgradeable = await ethers.getContractFactory("RegistryUpgradeable");

  const registry = await upgrades.deployProxy(RegistryUpgradeable, [], {
    initializer: "initialize",
  });

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const implAddress = await upgrades.erc1967.getImplementationAddress(address);

  console.log(`✅ RegistryUpgradeable proxy deployed at: ${address}`);
  console.log(`🧠 Implementation address: ${implAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
