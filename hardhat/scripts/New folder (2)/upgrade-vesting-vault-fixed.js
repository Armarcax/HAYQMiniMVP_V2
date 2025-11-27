// scripts/upgrade-vesting-vault-fixed.js
import pkg from "hardhat";
const { ethers, upgrades } = pkg;
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`💼 Using wallet: ${wallet.address}`);

    // Հին VestingVault proxy հասցե
    const OLD_VAULT = process.env.VESTING_VAULT_ADDRESS;

    // Ստանում ենք կոնտրակտի factory-ն նոր version-ի համար
    const VestingVaultFixed = await ethers.getContractFactory("VestingVaultFixed", wallet);

    console.log(`🔄 Upgrading VestingVault at proxy: ${OLD_VAULT} ...`);
    const upgraded = await upgrades.upgradeProxy(OLD_VAULT, VestingVaultFixed);
    console.log(`✅ Upgrade complete!`);
    console.log(`🔹 Proxy address (remains same): ${OLD_VAULT}`);
    console.log(`🔹 New implementation address: ${await upgrades.erc1967.getImplementationAddress(OLD_VAULT)}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
