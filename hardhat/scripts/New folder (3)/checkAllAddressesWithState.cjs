// scripts/checkAllAddressesWithState.cjs
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

  // --- Connect HAYQ Token contract ---
  const HAYQ = await ethers.getContractAt("HAYQMiniMVP", hayqProxy);

  // Օրինակ օգտատեր
  const testUser = process.env.HAYQ_ADDRESS;

  // Staked balance
  try {
    const stakedBalance = await HAYQ.stakedBalanceOf(testUser);
    console.log("\nStaked balance of", testUser, ":", stakedBalance.toString());
  } catch (e) {
    console.log("Error fetching staked balance:", e.message);
  }

  // Vesting totals (եթե vaultReadable սահմանված է)
  try {
    const totalVested = await HAYQ.vestingTotal(testUser);
    const released = await HAYQ.vestingReleased(testUser);
    console.log("Vesting total for", testUser, ":", totalVested.toString());
    console.log("Vesting released for", testUser, ":", released.toString());
  } catch (e) {
    console.log("Error fetching vesting info:", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
