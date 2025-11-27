// scripts/upgrade-hayq-uups.cjs
require('dotenv').config();
const { ethers, upgrades } = require("hardhat");

async function main() {
    // 💡 Proxy contract address (հին HAYQ proxy)
    const proxyAddress = process.env.HAYQ_PROXY_ADDRESS; // .env-ում

    if (!proxyAddress) {
        throw new Error("HAYQ_PROXY_ADDRESS not set in .env");
    }

    console.log("🚀 Upgrading HAYQ contract at proxy:", proxyAddress);

    // Ստեղծում ենք նոր Implementation contract factory
    const HAYQMiniMVP = await ethers.getContractFactory("HAYQMiniMVP");

    // Upgrade արա proxy՝ հասցեն նույնն է մնում
    const upgraded = await upgrades.upgradeProxy(proxyAddress, HAYQMiniMVP);

    await upgraded.waitForDeployment();

    console.log("✅ Upgrade complete!");
    console.log("🔗 Proxy address (unchanged):", await upgraded.getAddress());

    const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("🆕 New implementation address:", implAddress);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("❌ Upgrade failed:", error);
        process.exit(1);
    });
