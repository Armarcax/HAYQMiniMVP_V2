// deploy-new-proxy.js
const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("📦 Deploying new proxy (HAYQMiniMVP)...");

  // Deploy proxy
  const HAYQ = await ethers.getContractFactory("HAYQMiniMVP");
  const proxy = await upgrades.deployProxy(HAYQ, [], { initializer: "initialize" });
  await proxy.deployed();

  console.log("✅ Proxy deployed!");
  console.log("Proxy address:", proxy.address);

  // Update .env automatically
  const envPath = "./.env";
  let envContent = fs.readFileSync(envPath, "utf8");

  // Նոր պրոքսի հասցեն կփոխի HAYQ_CONTRACT_ADDRESS
  if (envContent.includes("HAYQ_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(/HAYQ_CONTRACT_ADDRESS=.*/g, `HAYQ_CONTRACT_ADDRESS=${proxy.address}`);
  } else {
    envContent += `\nHAYQ_CONTRACT_ADDRESS=${proxy.address}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env թարմացվեց նոր պրոքսի հասցեով:", proxy.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
