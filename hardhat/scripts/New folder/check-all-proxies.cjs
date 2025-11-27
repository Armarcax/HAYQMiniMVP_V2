// scripts/check-all-proxies.cjs
const hre = require("hardhat");
require("dotenv").config();

async function main() {
    const proxyAddresses = [
        "0xD116d9eFc270Ac44eb63b2eEb0fDCFC450d6Ee1a",
        "0x43867856F8f684a0d04a32e73Af446809C5fb28B",
        "0x8A201F37b106A1907B8147D5c19CE8E4D15e653B",
        "0xd17d1423DFd6c49932fFB8B5ebb61035BdCC48c6",
        "0xdEeCC1696fdff4786Bb5C9DA93350d8f6C62a86C",
        "0xc0132DB1835b9C53347ab628185165A81cCb848F",
        "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83"
    ];

    for (const address of proxyAddresses) {
        console.log("Proxy Address:", address);

        let owner = "N/A";
        let balance = "N/A";

        try {
            const HAYQ = await hre.ethers.getContractAt("HAYQMiniMVP", address);
            try {
                owner = await HAYQ.owner();
            } catch {
                owner = "Cannot fetch owner";
            }

            try {
                if (owner && owner !== "Cannot fetch owner") {
                    const rawBalance = await HAYQ.balanceOf(owner);
                    balance = rawBalance ? hre.ethers.utils.formatUnits(rawBalance, 18) : "0";
                }
            } catch {
                balance = "Cannot fetch balance";
            }

        } catch (err) {
            console.log("Error reading contract:", err.message || err);
        }

        console.log("Owner Address:", owner);
        console.log("Owner Balance:", balance, "HAYQ");
        console.log("-----------------------------------------------------");
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Fatal error:", err);
        process.exit(1);
    });
