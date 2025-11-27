import hre from "hardhat";

async function main() {
  // Ահա owner signer-ը՝ քո deploy-ի private key-ով
  const owner = new hre.ethers.Wallet(process.env.OWNER_PRIVATE_KEY, hre.ethers.provider);

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a");


  console.log("Owner:", owner.address);

  const start = Math.floor(Date.now() / 1000) + 60;
  const duration = 3600;

  const tx = await hayq.createTeamVesting(
    "4bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    1000,
    start,
    duration
  );

  await tx.wait();
  console.log("✅ Vesting created!");
}

main().catch(console.error);

