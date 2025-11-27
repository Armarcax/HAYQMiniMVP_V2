const hre = require("hardhat");

async function main() {
    const [funder] = await hre.ethers.getSigners();
    const to = "0xYourRecipientAddressHere"; // փոխիր հասցեն

    const amount = hre.ethers.utils.parseEther("1"); // 1 ETH
    console.log(`🔹 Sending ${hre.ethers.utils.formatEther(amount)} ETH from ${funder.address} to ${to}`);

    const tx = await funder.sendTransaction({
        to,
        value: amount
    });

    await tx.wait();
    console.log("✅ ETH transfer completed. Tx hash:", tx.hash);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
