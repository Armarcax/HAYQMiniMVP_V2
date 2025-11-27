// scripts/checkVestingAndStaked.cjs
require("dotenv").config();
const hre = require("hardhat");
const { upgrades } = hre;
const { ethers } = require("ethers"); // ✅ սա ավելացրու

async function main() {
  // ✅ սա հիմա ճիշտ է աշխատելու
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

  const HAYQ_PROXY = process.env.HAYQ_PROXY_ADDRESS;
  const VESTING_PROXY = process.env.VESTING_VAULT;

  console.log("===== HAYQ TOKEN =====");
  try {
    const proxyAdmin = await upgrades.erc1967.getAdminAddress(HAYQ_PROXY);
    const proxyImpl = await upgrades.erc1967.getImplementationAddress(HAYQ_PROXY);
    console.log("Proxy address:", HAYQ_PROXY);
    console.log("Proxy admin address:", proxyAdmin);
    console.log("Proxy implementation address:", proxyImpl);
  } catch (err) {
    console.error("HAYQ proxy info error:", err.message);
  }

  console.log("\n===== VESTING VAULT =====");
  try {
    const vestingImpl = await upgrades.erc1967.getImplementationAddress(VESTING_PROXY);
    console.log("Proxy address:", VESTING_PROXY);
    console.log("Implementation address:", vestingImpl);
  } catch (err) {
    console.error("Vesting proxy info error:", err.message);
  }

  // ✅ Սահմանում ենք ABI
  const HAYQ_ABI = ["function staked(address user) view returns (uint256)"];
  const VESTING_ABI = [
    "function totalVested(address user) view returns (uint256)",
    "function released(address user) view returns (uint256)"
  ];

  const hayq = new ethers.Contract(HAYQ_PROXY, HAYQ_ABI, provider);
  const vesting = new ethers.Contract(VESTING_PROXY, VESTING_ABI, provider);

  const users = [
    process.env.VESTING_BENEFICIARY,
    process.env.HAYQ_ADDRESS
  ];

  console.log("\n===== USER BALANCES =====");
  for (const user of users) {
    try {
      const staked = await hayq.staked(user);
      console.log(`Staked(${user}): ${ethers.formatUnits(staked, 18)}`);
    } catch (e) {
      console.log(`Staked(${user}): ERROR -> ${e.message}`);
    }

    try {
      const vested = await vesting.totalVested(user);
      const released = await vesting.released(user);
      console.log(`Total vested(${user}): ${ethers.formatUnits(vested, 18)}`);
      console.log(`Released(${user}): ${ethers.formatUnits(released, 18)}`);
    } catch (e) {
      console.log(`Vesting(${user}): ERROR -> ${e.message}`);
    }

    console.log("-------------------------");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  });
