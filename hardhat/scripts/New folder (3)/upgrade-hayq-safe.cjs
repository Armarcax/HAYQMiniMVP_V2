// scripts/upgrade-hayq-safe.cjs
require('dotenv').config();
const { ethers, upgrades } = require("hardhat");

async function main() {
    const proxyAddress = process.env.HAYQ_PROXY;
    if (!proxyAddress) throw new Error("Please set HAYQ_PROXY in your .env");

    console.log("🚀 Upgrading Transparent Proxy at:", proxyAddress);

    const HAYQMiniMVP = await ethers.getContractFactory("HAYQMiniMVP");

    let upgraded;
    try {
        // Specify transparent proxy explicitly
        upgraded = await upgrades.upgradeProxy(proxyAddress, HAYQMiniMVP, { kind: "transparent" });
        console.log("✅ Upgrade transaction sent!");
    } catch (err) {
        console.error("❌ Upgrade failed:", err.message || err);
        console.error(err.stack);
        process.exit(1);
    }

    // Fetch and display implementation address
    try {
        const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log("🔗 Proxy address (unchanged):", proxyAddress);
        console.log("🆕 New implementation:", implAddress);
    } catch (err) {
        console.error("⚠️ Could not fetch new implementation address:", err.message || err);
    }
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
