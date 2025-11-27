const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const NETWORK_RPC = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const TOKEN_ADDRESS = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
const VAULT_ADDRESS = "0x45615F3D52262ba7F16d7E0182893492F1752baB";

const recipients = [
    "0x928677743439e4dA4108c4025694B2F3d3b2745c",
    "0xBF3cfF21BD17854334112d28853fe716Eb423536",
    "0x95ae6b6237fe2c014bc09A5a0d52bF9999acDE30",
    "0xaF7c71E0105A6a28887598ae1D94Ddf3Cd03E0eb"
];

const STAKE_AMOUNT = "1000";

// Load ABIs
const tokenJson = JSON.parse(fs.readFileSync(path.resolve("./artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json")));
const tokenAbi = tokenJson.abi;

const vaultJson = JSON.parse(fs.readFileSync(path.resolve("./artifacts/contracts/VestingVaultUpgradeable.sol/VestingVaultUpgradeable.json")));
const vaultAbi = vaultJson.abi;

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log("🔗 Network wallet:", wallet.address);

    const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, wallet);
    const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, wallet);

    const balance = await token.balanceOf(wallet.address);
    console.log("💰 Balance:", balance.toString());

    for (const recipient of recipients) {
        try {
            // Վերցրու ճիշտ ֆունկցիան vesting ստուգելու համար, օրինակ `getVesting`
            let hasVesting = false;
            try {
                const vestingInfo = await vault.getVesting(recipient); // <-- ճշտիր կոնտրակտում անունը
                hasVesting = vestingInfo && !vestingInfo.amount.isZero();
            } catch (err) {
                console.warn(`${recipient} | Vesting check error: ${err.message}`);
            }

            if (!hasVesting) {
                console.log(`➡️ Applying vesting + stake for ${recipient}...`);
                const amountWei = ethers.utils.parseUnits(STAKE_AMOUNT, 18);
                const tx = await token.transfer(recipient, amountWei);
                await tx.wait();
                console.log(`${recipient} | Sent ${STAKE_AMOUNT} HAYQ | TX: ${tx.hash}`);
            } else {
                console.log(`ℹ️ ${recipient} already has vesting. Skipping.`);
            }

        } catch (err) {
            console.error(`${recipient} | ERROR: ${err.message}`);
        }
    }

    const finalBalance = await token.balanceOf(wallet.address);
    console.log("💰 Final Balance:", finalBalance.toString());
}

main().catch(err => console.error(err));
