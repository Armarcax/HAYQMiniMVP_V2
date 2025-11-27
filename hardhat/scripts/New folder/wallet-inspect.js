// scripts/wallet-inspect.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [wallet] = await hre.ethers.getSigners();
  const address = wallet.address;

  console.log("Inspecting wallet:", address);

  // HAYQ կոնտրակտի հասցեն .env-ից
  const hayqAddress = process.env.HAYQ_CONTRACT_ADDRESS;
  if (!hayqAddress) {
    console.error("❌ HAYQ_CONTRACT_ADDRESS not set in .env");
    return;
  }

  // ABI-ն artifacts-ից
  const HAYQ = await hre.ethers.getContractAt(
    "HAYQMiniMVP",
    hayqAddress
  );

  // Balance
  const balance = await HAYQ.balanceOf(address);
  console.log("HAYQ balance:", hre.ethers.formatUnits(balance, 18));

  // Staked amount
  if (HAYQ.staked) {
    const staked = await HAYQ.staked(address);
    console.log("Staked amount:", hre.ethers.formatUnits(staked, 18));
  }

  // Earned rewards (եթե կա)
  if (HAYQ.earned) {
    const earned = await HAYQ.earned(address);
    console.log("Earned rewards:", hre.ethers.formatUnits(earned, 18));
  }

  // Allowance to MockRouter (եթե ունենք)
  if (process.env.MOCK_ROUTER_ADDRESS && HAYQ.allowance) {
    const allowance = await HAYQ.allowance(address, process.env.MOCK_ROUTER_ADDRESS);
    console.log("Allowance to MockRouter:", hre.ethers.formatUnits(allowance, 18));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
