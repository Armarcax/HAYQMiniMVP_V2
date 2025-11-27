// scripts/wallet-full-inspect.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const HAYQ_ADDRESS = process.env.HAYQ_CONTRACT_ADDRESS;
const VESTING_ADDRESS = process.env.VESTING_ADDR;
const ETH_DIV_ADDRESS = process.env.ETH_DIV_ADDR;
const MOCK_ROUTER_ADDRESS = process.env.MOCK_ROUTER_ADDRESS;
const REWARD_TOKEN_ADDRESS = process.env.REWARD_TOKEN_ADDRESS;

async function main() {
    const [wallet] = await hre.ethers.getSigners();
    const address = wallet.address;

    console.log(`🔎 Inspecting wallet: ${address}\n`);

    // --- HAYQ token ---
    const HAYQ = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_ADDRESS);
    const hayqBalance = await HAYQ.balanceOf(address);
    console.log(`HAYQ balance: ${hre.ethers.formatUnits(hayqBalance, 18)}`);

    // --- Staked amount ---
    let stakedAmount = 0;
    try {
        stakedAmount = await HAYQ.staked(address);
        console.log(`Staked amount: ${hre.ethers.formatUnits(stakedAmount, 18)}`);
    } catch {
        console.log("Staked amount: ❌ not available");
    }

    // --- Reward token allowance ---
    if(REWARD_TOKEN_ADDRESS) {
        const Reward = await hre.ethers.getContractAt("MockERC20Upgradeable", REWARD_TOKEN_ADDRESS);
        const allowance = await Reward.allowance(address, MOCK_ROUTER_ADDRESS);
        console.log(`Allowance to MockRouter: ${hre.ethers.formatUnits(allowance, 18)}`);
    }

    // --- ETH Dividend Tracker ---
    if(ETH_DIV_ADDRESS) {
        const EthDiv = await hre.ethers.getContractAt("EthDividendTrackerUpgradeable", ETH_DIV_ADDRESS);
        try {
            const withdrawable = await EthDiv.withdrawableDividendOf(address);
            console.log(`ETH Dividends withdrawable: ${hre.ethers.formatUnits(withdrawable, 18)}`);
        } catch {
            console.log("ETH Dividends: ❌ not available");
        }
    }

    // --- Vesting ---
    if(VESTING_ADDRESS) {
        const Vesting = await hre.ethers.getContractAt("VestingVaultUpgradeable", VESTING_ADDRESS);
        try {
            const vestingInfo = await Vesting.vestings(address);
            console.log(`Vesting total: ${hre.ethers.formatUnits(vestingInfo.totalAmount, 18)}, released: ${hre.ethers.formatUnits(vestingInfo.released, 18)}`);
        } catch {
            console.log("Vesting info: ❌ not available");
        }
    }

    console.log("\n✅ Wallet inspection complete");
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
