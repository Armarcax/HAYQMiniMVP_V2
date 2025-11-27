const hre = require("hardhat");

async function main() {
    const hayqAddress = "0xYourHAYQContractAddress"; // գրիր HAYQ deployed հասցեն
    const recipient = "0xRecipientAddressHere"; // ստացող
    const amount = "1000"; // ուղարկվող HAYQ

    const [sender] = await hre.ethers.getSigners();
    const hayq = await hre.ethers.getContractAt("HAYQ", hayqAddress, sender);

    console.log(`🔹 Sending ${amount} HAYQ from ${sender.address} to ${recipient}`);
    const tx = await hayq.transfer(recipient, hre.ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    console.log("✅ HAYQ transfer completed. Tx hash:", tx.hash);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
