// scripts/show-reward-token-deployed.js
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log(`👤 Deployer address: ${deployer.address}`);
  console.log("🔍 Deploying MockERC20 (Reward Token)...");

  const MockERC20 = await hre.ethers.getContractFactory("MockERC20Upgradeable");
  const rewardToken = await hre.upgrades.deployProxy(
    MockERC20,
    ["Reward Token", "RWD", hre.ethers.parseUnits("1000000", 18)],
    { initializer: "initialize" }
  );

  await rewardToken.waitForDeployment();

  const addr = await rewardToken.getAddress();

  console.log(`✅ Reward Token deployed at: ${addr}`);
  console.log("\n💡 Copy this address to your .env or etherscan Read/Write as Proxy fields.");

  // Ընտրովի՝ կարող է պահել ֆայլում
  // import fs from "fs";
  // fs.writeFileSync("./reward-token-address.txt", addr + "\n");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
