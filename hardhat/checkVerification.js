// scripts/checkVerification.js
const hre = require("hardhat");

async function main() {
    const contracts = [
        {
            name: "VestingVaultUpgradeable",
            address: "0x45615F3D52262ba7F16d7E0182893492F1752baB"
        },
        {
            name: "VestingVaultUpgradeable (Implementation)",
            address: "0xd60CE25b670Dc7CA810497A0Ff7f2C0140aBD5c9"
        }
    ];

    for (const c of contracts) {
        console.log(`\nChecking verification for: ${c.name} at ${c.address}`);
        try {
            await hre.run("verify:verify", {
                address: c.address
            });
            console.log("✅ Verified or already verified");
        } catch (err) {
            if (err.message.includes("Already Verified")) {
                console.log("✅ Already verified");
            } else {
                console.log("❌ Not verified / Error:", err.message);
            }
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
