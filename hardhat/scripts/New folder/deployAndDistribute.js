// scripts/deployAndDistribute.js
import 'dotenv/config';
import { ethers, upgrades } from 'hardhat';

async function main() {
  // Սինխրոնացնել provider-ն և wallet-ը
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const owner = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

  console.log("Deploying contracts with owner:", owner.address);

  // 1️⃣ Deploy HAYQ proxy contract
  const HAYQ = await ethers.getContractFactory("HAYQ", owner);
  const hayq = await upgrades.deployProxy(HAYQ, ["HAYQ", "HQ"], { initializer: "initialize", kind: "uups" });
  await hayq.waitForDeployment();
  console.log("✅ HAYQ deployed at:", hayq.target || hayq.address);

  // 2️⃣ Mint HAYQ to recipients
  const recipients = process.env.RECIPIENTS.split(',');
  const amount = ethers.parseUnits(process.env.AMOUNT, 18);

  for (const r of recipients) {
    const tx = await hayq.mint(r, amount);
    await tx.wait();
    console.log(`✅ Minted ${process.env.AMOUNT} HAYQ to ${r}`);
  }

  // 3️⃣ Send some Ethers to contract (for buyback simulation if needed)
  if (process.env.ETHER_AMOUNT) {
    const ethAmount = ethers.parseEther(process.env.ETHER_AMOUNT);
    const tx = await owner.sendTransaction({ to: hayq.target || hayq.address, value: ethAmount });
    await tx.wait();
    console.log(`✅ Sent ${process.env.ETHER_AMOUNT} ETH to HAYQ contract`);
  }

  // 4️⃣ Optional: trigger buyback (example)
  try {
    const buybackAmount = ethers.parseUnits("100", 18); // change if needed
    const tx = await hayq.debugFundDividends(buybackAmount);
    await tx.wait();
    console.log(`✅ Buyback triggered for ${ethers.formatUnits(buybackAmount, 18)} HAYQ`);
  } catch(err) {
    console.warn("⚠️ Buyback step skipped or failed:", err.message);
  }

  console.log("🎉 All steps completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
