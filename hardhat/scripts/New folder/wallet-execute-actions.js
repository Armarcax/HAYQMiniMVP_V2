// scripts/wallet-execute-actions.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const {
  HAYQ_CONTRACT_ADDRESS,
  MOCK_ROUTER_ADDRESS,
  VESTING_ADDR,
  PRIVATE_KEY,
  STAKE_AMOUNT = "50",        // default: stake 50 HAYQ
  UNSTAKE_AMOUNT = "30",      // default: unstake 30 HAYQ
  APPROVE_AMOUNT = "100",     // default: approve 100 HAYQ to router
  VESTING_BENEFICIARY,        // if set and signer is owner -> will create vesting
  VESTING_AMOUNT = "100",     // amount in whole tokens (not wei)
  VESTING_START = "0",        // unix timestamp (0 => now+60)
  VESTING_DURATION = "3600"   // seconds
} = process.env;

function parseUnits(amountStr) {
  return hre.ethers.parseUnits(amountStr, 18);
}

function fmt(unitsBN) {
  return hre.ethers.formatUnits(unitsBN, 18);
}

async function main() {
  if (!HAYQ_CONTRACT_ADDRESS) throw new Error("HAYQ_CONTRACT_ADDRESS not set in .env");
  if (!PRIVATE_KEY) {
    console.warn("⚠️ PRIVATE_KEY not set. You must set it to perform transactions (owner or wallet). Aborting.");
    process.exit(1);
  }

  const provider = hre.ethers.provider;
  const wallet = new hre.ethers.Wallet(PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`, provider);
  console.log("Using wallet:", wallet.address);

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_CONTRACT_ADDRESS, wallet);

  // Basic balances
  const balanceBN = await hayq.balanceOf(wallet.address);
  console.log("HAYQ balance:", fmt(balanceBN));

  // Staked (if function exists)
  let stakedBN = hre.ethers.Zero;
  try {
    // prefer public mapping 'staked' or function 'staked' if available
    if (hayq.staked) {
      stakedBN = await hayq.staked(wallet.address);
    } else if (hayq.stakedOf) {
      stakedBN = await hayq.stakedOf(wallet.address);
    }
    console.log("Staked:", fmt(stakedBN));
  } catch {
    console.log("Staked: (not available)");
  }

  // 1) STAKE
  try {
    const stakeAmountBN = parseUnits(STAKE_AMOUNT);
    if (balanceBN.lt(stakeAmountBN)) {
      console.log(`❌ Not enough balance to stake ${STAKE_AMOUNT} HAYQ (have ${fmt(balanceBN)}) — skipping stake.`);
    } else {
      console.log(`➡️ Staking ${STAKE_AMOUNT} HAYQ...`);
      const tx = await hayq.connect(wallet).stake(stakeAmountBN);
      await tx.wait();
      console.log("✅ Stake tx mined:", tx.hash);
      // refresh staked
      try { stakedBN = await hayq.staked(wallet.address); console.log("New staked:", fmt(stakedBN)); }catch{}
    }
  } catch (err) {
    console.error("❌ Stake failed:", err.message || err);
  }

  // 2) UNSTAKE
  try {
    const unstakeAmountBN = parseUnits(UNSTAKE_AMOUNT);
    if (stakedBN.lt(unstakeAmountBN)) {
      console.log(`❌ Not enough staked to unstake ${UNSTAKE_AMOUNT} (staked ${fmt(stakedBN)}) — skipping unstake.`);
    } else {
      console.log(`➡️ Unstaking ${UNSTAKE_AMOUNT} HAYQ...`);
      const tx = await hayq.connect(wallet).unstake(unstakeAmountBN);
      await tx.wait();
      console.log("✅ Unstake tx mined:", tx.hash);
      try { stakedBN = await hayq.staked(wallet.address); console.log("New staked:", fmt(stakedBN)); }catch{}
    }
  } catch (err) {
    console.error("❌ Unstake failed:", err.message || err);
  }

  // 3) APPROVE to MockRouter
  if (MOCK_ROUTER_ADDRESS && MOCK_ROUTER_ADDRESS !== "0x0") {
    try {
      const approveAmountBN = parseUnits(APPROVE_AMOUNT);
      const currentAllowance = await hayq.allowance(wallet.address, MOCK_ROUTER_ADDRESS);
      console.log("Current allowance to MockRouter:", fmt(currentAllowance));
      if (currentAllowance.lt(approveAmountBN)) {
        console.log(`➡️ Approving ${APPROVE_AMOUNT} HAYQ to router ${MOCK_ROUTER_ADDRESS}...`);
        const tx = await hayq.connect(wallet).approve(MOCK_ROUTER_ADDRESS, approveAmountBN);
        await tx.wait();
        console.log("✅ Approve tx mined:", tx.hash);
      } else {
        console.log("✅ Allowance sufficient — skipping approve.");
      }
    } catch (err) {
      console.error("❌ Approve failed:", err.message || err);
    }
  } else {
    console.log("⚠️ MOCK_ROUTER_ADDRESS not set or zero — skipping approve.");
  }

  // 4) OWNER-ONLY ACTIONS: createTeamVesting, buyback, mint — only if signer is owner
  try {
    const contractOwner = await hayq.owner();
    const isOwner = contractOwner.toLowerCase() === wallet.address.toLowerCase();
    console.log("Contract owner:", contractOwner, " | signer is owner?", isOwner ? "✅ yes" : "❌ no");

    if (isOwner && VESTING_BENEFICIARY) {
      // prepare params
      const vestAmountWhole = VESTING_AMOUNT;
      const vestAmountWithDecimals = parseUnits(vestAmountWhole);
      let start = Number(VESTING_START);
      if (start === 0) start = Math.floor(Date.now() / 1000) + 60; // default now + 60s
      const duration = Number(VESTING_DURATION);

      console.log(`➡️ Creating team vesting beneficiary=${VESTING_BENEFICIARY} amount=${vestAmountWhole} start=${start} duration=${duration}`);
      const tx = await hayq.connect(wallet).createTeamVesting(VESTING_BENEFICIARY, vestAmountWhole, start, duration);
      await tx.wait();
      console.log("✅ createTeamVesting tx mined:", tx.hash);
    } else {
      if (!isOwner) console.log("⚠️ Signer not owner — skipping owner-only actions (createTeamVesting / buyback / mint).");
      else if (!VESTING_BENEFICIARY) console.log("⚠️ VESTING_BENEFICIARY not set — skipping createTeamVesting.");
    }
  } catch (err) {
    console.error("❌ Owner actions failed:", err.message || err);
  }

  // 5) Show final snapshot
  try {
    const finalBalance = await hayq.balanceOf(wallet.address);
    const finalStaked = await hayq.staked(wallet.address);
    const finalAllowance = MOCK_ROUTER_ADDRESS && MOCK_ROUTER_ADDRESS !== "0x0" ? await hayq.allowance(wallet.address, MOCK_ROUTER_ADDRESS) : hre.ethers.Zero;

    console.log("\n--- Final snapshot ---");
    console.log("HAYQ balance:", fmt(finalBalance));
    console.log("Staked:", fmt(finalStaked));
    if (MOCK_ROUTER_ADDRESS) console.log("Allowance to router:", fmt(finalAllowance));
    console.log("----------------------");
  } catch (err) {
    console.error("❌ Final snapshot failed:", err.message || err);
  }

  console.log("\n✅ Script finished.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exitCode = 1;
});
