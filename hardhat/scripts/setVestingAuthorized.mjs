// scripts/setVestingAuthorized.mjs
import pkg from "hardhat";
const { ethers } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("💼 Signer:", deployer.address);

  const vaultAddr = process.env.VESTING_VAULT;
  if (!vaultAddr) throw new Error("Set VESTING_VAULT in .env");

  const Vault = await ethers.getContractAt("VestingVaultUpgradeable", vaultAddr);
  const who = process.env.HAYQ_ADDRESS || process.env.HAYQ_PROXY || process.env.NEW_HAYQ_PROXY;
  if (!who) throw new Error("Set HAYQ_ADDRESS in .env");

  const tx = await Vault.connect(deployer).setAuthorized(who, true);
  await tx.wait();
  console.log("✅ Authorized set for", who, "tx:", tx.hash);
}
main().catch(e => { console.error(e); process.exit(1); });
