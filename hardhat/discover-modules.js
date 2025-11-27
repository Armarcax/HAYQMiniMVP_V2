// scripts/discover-modules.js
import hre from "hardhat";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const NETWORK = hre.network.name;

async function main() {
    const [caller] = await hre.ethers.getSigners();
    console.log(`🔍 Discovering deployed contracts on network: ${NETWORK}\n`);

    const output = {};

    // --- 1️⃣ Reward Token (MockERC20) ---
    try {
        const rewardAddr = process.env.REWARD_TOKEN_ADDRESS;
        if (!rewardAddr) throw new Error("REWARD_TOKEN_ADDRESS not set in .env");

        const MockERC20 = await hre.ethers.getContractFactory("MockERC20Upgradeable");
        const rewardToken = MockERC20.attach(rewardAddr);

        const name = await rewardToken.name();
        const symbol = await rewardToken.symbol();
        const totalSupply = await rewardToken.totalSupply();
        let owner;
        try { owner = await rewardToken.owner(); } catch { owner = "n/a"; }

        console.log(`✅ Reward Token found at: ${rewardAddr}`);
        console.log(`   Name: ${name}, Symbol: ${symbol}, TotalSupply: ${hre.ethers.formatUnits(totalSupply, 18)}, Owner: ${owner}\n`);

        output.REWARD_TOKEN_ADDRESS = rewardAddr;
        output.REWARD_TOKEN_NAME = name;
        output.REWARD_TOKEN_SYMBOL = symbol;
        output.REWARD_TOKEN_TOTALSUPPLY = hre.ethers.formatUnits(totalSupply, 18);
        output.REWARD_TOKEN_OWNER = owner;

    } catch (err) {
        console.error("❌ Reward Token discovery failed:", err.message);
    }

    // --- 2️⃣ HAYQ + VestingVault ---
    try {
        const hayqAddr = process.env.HAYQ_ADDRESS;
        if (!hayqAddr) throw new Error("HAYQ_ADDRESS not set in .env");

        const HAYQ = await hre.ethers.getContractFactory("HAYQMiniMVP");
        const hayq = HAYQ.attach(hayqAddr);

        const vestingVaultAddr = await hayq.vestingVault();
        console.log(`✅ HAYQ MiniMVP found at: ${hayqAddr}`);
        console.log(`   Linked VestingVault: ${vestingVaultAddr}\n`);

        output.HAYQ_ADDRESS = hayqAddr;
        output.VESTING_VAULT_ADDRESS = vestingVaultAddr;

    } catch (err) {
        console.error("❌ HAYQ / VestingVault discovery failed:", err.message);
    }

    // --- 3️⃣ MockRouter ---
    try {
        const routerAddr = process.env.MOCK_ROUTER_ADDRESS;
        if (!routerAddr) throw new Error("MOCK_ROUTER_ADDRESS not set in .env");

        const MockRouter = await hre.ethers.getContractFactory("MockRouter");
        const router = MockRouter.attach(routerAddr);

        console.log(`✅ MockRouter found at: ${routerAddr}`);
        output.MOCK_ROUTER_ADDRESS = routerAddr;

    } catch (err) {
        console.error("❌ MockRouter discovery failed:", err.message);
    }

    // --- 4️⃣ Save output to JSON and .env ---
    const pathJson = `./discovered-${NETWORK}.json`;
    fs.writeFileSync(pathJson, JSON.stringify(output, null, 2));
    console.log(`\n📁 All addresses saved to: ${pathJson}`);

    const pathEnv = `./discovered-${NETWORK}.env`;
    const envLines = Object.entries(output).map(([k, v]) => `${k}=${v}`);
    fs.writeFileSync(pathEnv, envLines.join("\n"));
    console.log(`📄 Env-ready addresses saved to: ${pathEnv}`);

    console.log("\n✅ Discovery complete");
}

main().catch(err => {
    console.error("Discovery script error:", err);
    process.exitCode = 1;
});
