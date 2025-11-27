const { ethers, upgrades } = require("hardhat");

async function main() {
  const MockOracleV2 = await ethers.getContractFactory("MockOracleV2");
  console.log("🚀 Deploying MockOracleV2 as upgradeable proxy...");

  const proxy = await upgrades.deployProxy(MockOracleV2, [], {
    initializer: "initialize",
  });
  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("✅ Proxy deployed to:", proxyAddress);
  console.log("🔗 Implementation (logic) at:", implAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
