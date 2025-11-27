// scripts/checkAllAddresses.cjs
require("dotenv").config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("===== HAYQ TOKEN =====");
  const hayqProxy = process.env.HAYQ_PROXY_ADDRESS;
  const hayqAdmin = await upgrades.erc1967.getAdminAddress(hayqProxy);
  const hayqImpl = await upgrades.erc1967.getImplementationAddress(hayqProxy);
  console.log("Proxy address:", hayqProxy);
  console.log("Proxy admin address:", hayqAdmin);
  console.log("Implementation address:", hayqImpl);

  console.log("\n===== VESTING VAULT =====");
  const vestingProxy = process.env.VESTING_VAULT;
  const vestingImpl = await upgrades.erc1967.getImplementationAddress(vestingProxy);
  console.log("Proxy address:", vestingProxy);
  console.log("Implementation address:", vestingImpl);

  console.log("\n===== OTHER ADDRESSES FROM .ENV =====");
  console.log("HAYQ_ADDRESS:", process.env.HAYQ_ADDRESS);
  console.log("MULTISIG_ADDR:", process.env.MULTISIG_ADDR);
  console.log("REWARD_TOKEN_ADDRESS:", process.env.REWARD_TOKEN_ADDRESS);
  console.log("ETH_DIV_ADDR:", process.env.ETH_DIV_ADDR);
  console.log("MOCK_ROUTER_ADDRESS:", process.env.MOCK_ROUTER_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
