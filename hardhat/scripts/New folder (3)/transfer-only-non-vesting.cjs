// scripts/transfer-only-non-vesting.cjs
const hre = require("hardhat");
const { ethers } = hre;
require("dotenv").config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const HAYQ = await hre.ethers.getContractAt("HAYQMiniMVP", process.env.HAYQ_CONTRACT_ADDRESS, wallet);

    const recipients = process.env.RECIPIENTS.split(",");
    const amount = ethers.utils.parseEther(process.env.AMOUNT || "1000");

    console.log(`👑 Sender: ${wallet.address}`);
    const senderBalance = await HAYQ.balanceOf(wallet.address);
    console.log(`💰 Sender balance: ${ethers.utils.formatEther(senderBalance)}`);

    const vestingVault = await HAYQ.vestingVault();

    for (const recipient of recipients) {
        let skip = false;

        if (vestingVault !== ethers.constants.AddressZero) {
            try {
                const vestingInfo = await HAYQ.getVestingInfo(recipient); // կամ vestingVault.getVesting(recipient)
                if (vestingInfo && vestingInfo.amount > 0) {
                    skip = true;
                    console.log(`⚠️ Skipping vesting address: ${recipient}`);
                }
            } catch (err) {
                // եթե ֆունկցիան չի աշխատում, լռել
            }
        }

        if (!skip) {
            const tx = await HAYQ.transfer(recipient, amount);
            await tx.wait();
            console.log(`➡️ Transferred ${ethers.utils.formatEther(amount)} to ${recipient} | tx: ${tx.hash}`);
        }
    }

    const finalBalance = await HAYQ.balanceOf(wallet.address);
    console.log(`💰 Final sender balance: ${ethers.utils.formatEther(finalBalance)}`);
}

main().catch(console.error);
