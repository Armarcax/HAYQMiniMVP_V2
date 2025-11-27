// scripts/create-vesting-stable.js
import hre from "hardhat";

async function main() {
    const [signer] = await hre.ethers.getSigners();
    const HAYQ_PROXY = "0x7E5c8baC4447D8FA7010AEc8D400Face1b1BEC83";
    const RECIPIENT = "0x928677743439e4dA4108c4025694B2F3d3b2745c";
    const VESTING_AMOUNT = hre.ethers.parseUnits("1000", 18);
    const START = Math.floor(Date.now() / 1000) + 60; // 1 րոպե հետո
    const DURATION = 3600; // 1 ժամ

    console.log("Connecting to HAYQ contract...");
    const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY, signer);

    const ownerBalanceRaw = await hayq.balanceOf(signer.address);
    const ownerBalance = hre.ethers.BigNumber.from(ownerBalanceRaw);

    console.log(`Owner balance: ${hre.ethers.formatUnits(ownerBalance, 18)} HAYQ`);
    if (ownerBalance.lt(VESTING_AMOUNT)) {
        const missing = VESTING_AMOUNT.sub(ownerBalance);
        console.log(`Owner balance too low. Minting ${hre.ethers.formatUnits(missing, 18)} HAYQ...`);
        const mintTx = await hayq.mint(signer.address, missing);
        await mintTx.wait();
        console.log("✅ Mint completed.");
    }

    // ստուգել vesting vault–ի մնացորդը
    const vaultAddr = "0x742FDc94fD2B690415eD33E4f23222E85e775b35"; // VestingVault proxy
    const vaultBalanceRaw = await hayq.balanceOf(vaultAddr);
    const vaultBalance = hre.ethers.BigNumber.from(vaultBalanceRaw);

    if (vaultBalance.lt(VESTING_AMOUNT)) {
        const needed = VESTING_AMOUNT.sub(vaultBalance);
        console.log(`Vault balance too low. Transferring ${hre.ethers.formatUnits(needed, 18)} HAYQ to vault...`);
        const transferTx = await hayq.transfer(vaultAddr, needed);
        await transferTx.wait();
        console.log("✅ Transfer to vault completed.");
    }

    console.log(`Creating vesting for ${RECIPIENT}...`);
    const vestingTx = await hayq.createTeamVesting(RECIPIENT, VESTING_AMOUNT, START, DURATION);
    await vestingTx.wait();
    console.log("✅ Vesting created successfully!");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
