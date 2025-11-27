const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    // Ստեղծում ենք provider
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

    // Wallet ստեղծում
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Wallet address:", wallet.address);

    // Ստուգում մնացորդը նոր վերսիայով
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
}

main().catch(console.error);
