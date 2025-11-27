import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = hre.ethers.provider;
  const currentOwner = new hre.ethers.Wallet(process.env.CURRENT_OWNER_PRIVATE_KEY, provider);

  const proxy = process.env.HAYQ_CONTRACT_ADDRESS;
  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", proxy, currentOwner);

  const newOwner = "0x928677743439e4dA4108c4025694B2F3d3b2745c"; // քո metamask address

  console.log("Transferring ownership from", currentOwner.address, "to", newOwner);
  const tx = await hayq.transferOwnership(newOwner);
  console.log("Waiting for tx...", tx.hash);
  await tx.wait();
  console.log("✅ Ownership transferred to:", newOwner, "tx:", tx.hash);
}

main().catch((e)=>{ console.error(e); process.exitCode=1; });
