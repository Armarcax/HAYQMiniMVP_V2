const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0x4f562cc34dd3b4C61f691B643BA6aA24a788d689";
  const MockOracleV2 = await ethers.getContractFactory("MockOracleV2");

  const oracle = await MockOracleV2.attach(proxyAddress);

  // Կանչում ենք initialize(), որ owner դառնա deployer-ը
  await oracle.initialize();
  console.log("✅ Proxy initialized successfully!");
}

main().catch(console.error);
