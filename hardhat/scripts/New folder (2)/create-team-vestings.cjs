// scripts/create-team-vestings.cjs
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("💼 Using wallet:", deployer.address);

    const HAYQProxy = process.env.HAYQ_PROXY; // ⚠️ Պետք է proxy լինի
    const vaultAddress = process.env.VESTING_VAULT;

    if (!HAYQProxy || !vaultAddress) {
        throw new Error("Set HAYQ_PROXY and VESTING_VAULT in .env");
    }

    const HAYQ = await ethers.getContractAt("HAYQMiniMVP", HAYQProxy);

    // Ստուգել և սահմանել vestingVault-ը, եթե անհրաժեշտ է
    const currentVault = await HAYQ.vestingVault();
    if (currentVault.toLowerCase() !== vaultAddress.toLowerCase()) {
        console.log("⚠️ Setting vesting vault...");
        const tx = await HAYQ.setVestingVault(vaultAddress);
        await tx.wait();
        console.log("✅ Vesting vault set");
    }

    const vestings = [
        { beneficiary: "0x928677743439e4dA4108c4025694B2F3d3b2745c", amount: 100 },
        { beneficiary: "0xBF3cfF21BD17854334112d28853fe716Eb423536", amount: 100 },
        { beneficiary: "0x95ae6b6237fe2c014bc09A5a0d52bF9999acDE30", amount: 100 },
        { beneficiary: "0xaF7c71E0105A6a28887598ae1D94Ddf3Cd03E0eb", amount: 100 },
        // Ավելացրու նոր տողեր ըստ ցանկության
    ];

    const now = Math.floor(Date.now() / 1000);
    const DURATION_30D = 30 * 24 * 3600;
    const DURATION_60D = 60 * 24 * 3600;

    for (let i = 0; i < vestings.length; i++) {
        const v = vestings[i];
        const duration = i === 0 ? DURATION_30D : DURATION_60D;

        try {
            console.log(`⏳ Creating vesting for ${v.beneficiary} (${v.amount} HAYQ)...`);
            const tx = await HAYQ.createTeamVesting(v.beneficiary, v.amount, now, duration);
            console.log(`🕒 Tx: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ Success for ${v.beneficiary}`);
        } catch (err) {
            console.log(`⚠️ Failed for ${v.beneficiary}:`, err.reason || err.message);
        }
    }

    console.log("🎯 All vestings created via HAYQ contract!");
}

main().catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
});