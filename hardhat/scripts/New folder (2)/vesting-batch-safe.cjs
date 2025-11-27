const { ethers } = require("hardhat");
require('dotenv').config();

(async () => {
    const AMOUNT = process.env.VESTING_AMOUNT || "100";
    const DECIMALS = process.env.DECIMALS || "18";
    const RECIPIENTS = (process.env.RECIPIENTS || "").split(",");
    const START = parseInt(process.env.VESTING_START || "0");
    const DURATION = parseInt(process.env.VESTING_DURATION || "3600");
    const vestingAddress = process.env.VESTING_VAULT;

    const VestingVault = await ethers.getContractFactory("VestingVaultUpgradeable");
    const vesting = await VestingVault.attach(vestingAddress);

    // Սա parseUnits պետք է ճիշտ ստացվի
    const parsedAmount = ethers.BigNumber.from(AMOUNT).mul(ethers.BigNumber.from("10").pow(DECIMALS));

    for (const recipient of RECIPIENTS) {
        try {
            await vesting.allocateVesting(recipient, parsedAmount, START, DURATION);
            console.log(`✅ Allocated ${AMOUNT} tokens to ${recipient}`);
        } catch (e) {
            console.log(`⚠️ Խնդիր ${recipient}-ի հետ:`, e.message);
        }
    }
})();
