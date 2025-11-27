// scripts/link-contracts.mjs
import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("💼 Wallet:", deployer.address);

  const HAYQ = process.env.HAYQ_ADDRESS || process.env.HAYQ_PROXY || process.env.HAYQ_TOKEN;
  if (!HAYQ) throw new Error("Set HAYQ_ADDRESS in .env");

  const hayq = await ethers.getContractAt("HAYQMiniMVP", HAYQ);

  const router = process.env.MOCK_ROUTER_ADDRESS;
  if (router) {
    console.log("➡️ setRouter to", router);
    const tx = await hayq.connect(deployer).setRouter(router);
    await tx.wait();
    console.log("✅ setRouter tx:", tx.hash);
  } else console.log("⚠️ MOCK_ROUTER_ADDRESS not set");

  const vault = process.env.VESTING_VAULT || process.env.VESTING_ADDRESS;
  if (vault) {
    console.log("➡️ setVestingVault to", vault);
    const tx2 = await hayq.connect(deployer).setVestingVault(vault);
    await tx2.wait();
    console.log("✅ setVestingVault tx:", tx2.hash);
  } else console.log("⚠️ VESTING_VAULT not set");

  const readable = process.env.VESTING_VAULT_ADDRESS;
  if (readable) {
    console.log("➡️ setVestingVaultReadable to", readable);
    const tx3 = await hayq.connect(deployer).setVestingVaultReadable(readable);
    await tx3.wait();
    console.log("✅ setVestingVaultReadable tx:", tx3.hash);
  } else console.log("⚠️ VESTING_VAULT_ADDRESS not set");
}

main().catch((e)=>{ console.error(e); process.exit(1); });
