const { ethers, upgrades } = require("hardhat");

async function main() {
  // 💡 սա քո արդեն գոյություն ունեցող Vesting Vault proxy-ն է
  const proxyAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB"; 

  console.log("🚀 Upgrading VestingVaultUpgradeable...");

  // ⚡ Հավաստիանում ենք, որ contract-ի անունը նույնն է՝ VestingVaultUpgradeable
  const Vault = await ethers.getContractFactory("VestingVaultUpgradeable");

  const upgraded = await upgrades.upgradeProxy(proxyAddress, Vault);

  console.log("✅ Upgrade successful!");
  console.log("🆕 New implementation address:", await upgrades.erc1967.getImplementationAddress(upgraded.target));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Upgrade failed:", error);
    process.exit(1);
  });
