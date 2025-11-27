// scripts/single-vesting.js
import hre from "hardhat";
import "dotenv/config";

async function main() {
  // Owner wallet պետք է լինի contract-ի իրական owner
  const NEW_HAYQ_PROXY = "0xc0132DB1835b9C53347ab628185165A81cCb848F";
  
  // Վերցնում ենք wallet owner-ով
  const provider = new hre.ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const ownerWallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Կապը կոնտրակտին
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", NEW_HAYQ_PROXY, ownerWallet);

  // Դրամապանակի հասցեն, որի համար vesting պետք է ստեղծել
  const beneficiary = "0x928677743439e4dA4108c4025694B2F3d3b2745c";

  // Սկզբնական պարամետրերը
  const amount = hre.ethers.parseUnits("1000", 18); // 1000 HAYQ
  const start = Math.floor(Date.now() / 1000) + 60; // այժմ + 1 րոպե
  const duration = 3600; // 1 ժամ

  try {
    const tx = await hayq.createTeamVesting(beneficiary, amount, start, duration);
    console.log(`✅ Vesting tx sent! Hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`🎉 Vesting confirmed in block ${receipt.blockNumber}`);
  } catch (err) {
    console.error("❌ Error creating vesting:", err);
  }
}

main();
