// scripts/check-owner-extended.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = hre.ethers.provider;
  const wallet = new hre.ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);

  const proxy = process.env.HAYQ_CONTRACT_ADDRESS;
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", proxy);

  const contractOwner = await hayq.owner();
  console.log("Contract owner():", contractOwner);
  console.log("Using signer:", wallet.address);

  const isOwner = contractOwner.toLowerCase() === wallet.address.toLowerCase();
  if (isOwner) {
    console.log("✅ You are the owner — good to proceed.");
  } else {
    console.log("❌ Not owner. Minting/vesting may fail.");
  }

  // փոքրիկ privileges թեստ
  try {
    console.log("Checking minting ability...");
    const mintAmount = hre.ethers.parseUnits("1", 18);
    const tx = await hayq.connect(wallet).mint(wallet.address, mintAmount);
    await tx.wait();
    console.log("✅ Mint succeeded — wallet has owner privileges.");
  } catch (err) {
    console.log("❌ Mint failed — wallet cannot mint:", err.reason || err.message);
  }

  try {
    console.log("Checking vesting creation...");
    const start = Math.floor(Date.now() / 1000) + 60;
    const duration = 3600;
    const tx = await hayq.connect(wallet).createTeamVesting(
      wallet.address,
      hre.ethers.parseUnits("1", 18),
      start,
      duration
    );
    await tx.wait();
    console.log("✅ Vesting creation succeeded.");
  } catch (err) {
    console.log("❌ Vesting creation failed:", err.reason || err.message);
  }
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
