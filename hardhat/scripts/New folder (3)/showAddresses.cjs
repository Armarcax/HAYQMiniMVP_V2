require("dotenv").config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Proxy & implementation հասցեներ .env-ից
  const proxyAddress = process.env.HAYQ_PROXY_ADDRESS;
  const vestingProxy = process.env.PROXY_ADDRESS;
  const implementation = process.env.IMPLEMENTATION_ADDRESS;
  const vestingImpl = process.env.VESTING_IMPL;
  const proxyAdmin = process.env.PROXY_ADMIN_ADDRESS;

  console.log("===== HAYQ TOKEN =====");
  console.log("Proxy address:", proxyAddress);
  console.log("Proxy admin address:", proxyAdmin);
  console.log("Implementation address:", implementation);

  console.log("\n===== VESTING VAULT =====");
  console.log("Proxy address:", vestingProxy);
  console.log("Implementation address:", vestingImpl);

  // Եթե ուզում ես, կարող ենք ավելացնել մնացած բոլոր հասցեներն էլ .env-ից
  console.log("\n===== OTHER ADDRESSES FROM .ENV =====");
  console.log("HAYQ_ADDRESS:", process.env.HAYQ_ADDRESS);
  console.log("MULTISIG_ADDR:", process.env.MULTISIG_ADDR);
  console.log("REWARD_TOKEN_ADDRESS:", process.env.REWARD_TOKEN_ADDRESS);
  console.log("ETH_DIV_ADDR:", process.env.ETH_DIV_ADDR);
  console.log("MOCK_ROUTER_ADDRESS:", process.env.MOCK_ROUTER_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
