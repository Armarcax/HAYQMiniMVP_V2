// --- Ստուգված Hardhat console script ---

const { ethers } = require("hardhat");

async function main() {
    // 1️⃣ HAYQ contract proxy address
    const HAYQAddress = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQAddress);

    // 2️⃣ VestingVault address
    const vaultAddress = "0x45615F3D52262ba7F16d7E0182893492F1752baB";
    const Vault = await ethers.getContractAt("VestingVaultUpgradeable", vaultAddress);

    // 3️⃣ Print addresses
    console.log("HAYQ contract address:", HAYQAddress);
    console.log("Vault contract address:", vaultAddress);

    // 4️⃣ Vault HAYQ balance
    const vaultBalance = await HAYQ.balanceOf(vaultAddress);
    console.log("Vault HAYQ balance:", ethers.formatUnits(vaultBalance, 18));

    // 5️⃣ Vault owner
    const owner = await Vault.owner();
    console.log("Vault owner address:", owner);
}

// Execute
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
