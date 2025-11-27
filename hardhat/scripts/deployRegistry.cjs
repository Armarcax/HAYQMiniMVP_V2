const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying RegistryUpgradeable...");

  const Registry = await ethers.getContractFactory("RegistryUpgradeable");

  // Deploy proxy (initializer՝ եթե contract-ում կա initialize())
  const registry = await upgrades.deployProxy(Registry, [], { initializer: "initialize" });

  // Proxy արդեն հասանելի է, .deployed() կանչելու կարիք չկա
  console.log("✅ RegistryUpgradeable deployed at:", registry.address);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
