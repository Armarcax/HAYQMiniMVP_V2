// scripts/wallet-execute-actions-fixed.js
import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const {
  HAYQ_CONTRACT_ADDRESS,
  MOCK_ROUTER_ADDRESS,
  VESTING_ADDR,
  PRIVATE_KEY,
  STAKE_AMOUNT = "50",
  UNSTAKE_AMOUNT = "30",
  APPROVE_AMOUNT = "100",
  VESTING_BENEFICIARY,
  VESTING_AMOUNT = "100",
  VESTING_START = "0",
  VESTING_DURATION = "3600"
} = process.env;

const parseUnits = (s) => hre.ethers.parseUnits(s, 18);
const fmt = (bn) => hre.ethers.formatUnits(bn, 18);

async function main() {
  if (!HAYQ_CONTRACT_ADDRESS) throw new Error("HAYQ_CONTRACT_ADDRESS not set in .env");
  if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not set in .env — cannot send transactions.");
    process.exit(1);
  }

  const provider = hre.ethers.provider;
  const wallet = new hre.ethers.Wallet(PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`, provider);
  console.log("Using wallet:", wallet.address);

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_CONTRACT_ADDRESS, wallet);

  // Read balances (BigInt)
  const balanceBN = await hayq.balanceOf(wallet.address); // BigInt
  console.log("HAYQ balance:", fmt(balanceBN));

  // read staked if available
  let stakedBN = 0n;
  try {
    // mapping getter 'staked' exists in your contract: staked(address)
    stakedBN = await hayq.staked(wallet.address);
    console.log("Staked:", fmt(stakedBN));
  } catch {
    console.log("Staked: (not available)");
  }

  // STAKE
  try {
    const stakeAmountBN = parseUnits(STAKE_AMOUNT); // BigInt
    if (balanceBN < stakeAmountBN) {
      console.log(`❌ Not enough balance to stake ${STAKE_AMOUNT} HAYQ (have ${fmt(balanceBN)}) — skipping stake.`);
    } else {
      console.log(`➡️ Staking ${STAKE_AMOUNT} HAYQ...`);
      const tx = await hayq.connect(wallet).stake(stakeAmountBN);
      await tx.wait();
      console.log("✅ Stake tx mined:", tx.hash);
      // refresh staked
      try { stakedBN = await hayq.staked(wallet.address); console.log("New staked:", fmt(stakedBN)); } catch {}
    }
  } catch (err) {
    console.error("❌ Stake failed:", err?.message ?? err);
  }

  // UNSTAKE
  try {
    const unstakeAmountBN = parseUnits(UNSTAKE_AMOUNT);
    if (stakedBN < unstakeAmountBN) {
      console.log(`❌ Not enough staked to unstake ${UNSTAKE_AMOUNT} (staked ${fmt(stakedBN)}) — skipping unstake.`);
    } else {
      console.log(`➡️ Unstaking ${UNSTAKE_AMOUNT} HAYQ...`);
      const tx = await hayq.connect(wallet).unstake(unstakeAmountBN);
      await tx.wait();
      console.log("✅ Unstake tx mined:", tx.hash);
      try { stakedBN = await hayq.staked(wallet.address); console.log("New staked:", fmt(stakedBN)); } catch {}
    }
  } catch (err) {
    console.error("❌ Unstake failed:", err?.message ?? err);
  }

  // APPROVE to Router
  if (MOCK_ROUTER_ADDRESS && MOCK_ROUTER_ADDRESS !== "0x0") {
    try {
      const approveAmountBN = parseUnits(APPROVE_AMOUNT);
      const currentAllowance = await hayq.allowance(wallet.address, MOCK_ROUTER_ADDRESS);
      console.log("Current allowance to MockRouter:", fmt(currentAllowance));
      if (currentAllowance < approveAmountBN) {
        console.log(`➡️ Approving ${APPROVE_AMOUNT} HAYQ to router ${MOCK_ROUTER_ADDRESS}...`);
        const tx = await hayq.connect(wallet).approve(MOCK_ROUTER_ADDRESS, approveAmountBN);
        await tx.wait();
        console.log("✅ Approve tx mined:", tx.hash);
      } else {
        console.log("✅ Allowance sufficient — skipping approve.");
      }
    } catch (err) {
      console.error("❌ Approve failed:", err?.message ?? err);
    }
  } else {
    console.log("⚠️ MOCK_ROUTER_ADDRESS not set or zero — skipping approve.");
  }

  // OWNER-ONLY ACTIONS (createTeamVesting) — but we MUST NOT invoke createTeamVesting
  // if VestingVault.createVesting still expects transferFrom (bug) — check pattern
  try {
    const contractOwner = await hayq.owner();
    const isOwner = contractOwner.toLowerCase() === wallet.address.toLowerCase();
    console.log("Contract owner:", contractOwner, " | signer is owner?", isOwner ? "✅ yes" : "❌ no");

    if (isOwner && VESTING_BENEFICIARY) {
      // before calling createTeamVesting, detect VestingVault behaviour
      if (!VESTING_ADDR || VESTING_ADDR === "0x0") {
        console.log("⚠️ VESTING_ADDR not set — skipping createTeamVesting.");
      } else {
        // Fetch the VestingVault bytecode ABI / try a small simulation: call estimateGas for createVesting via HAYQ
        // But to avoid revert, we won't call createTeamVesting automatically.
        console.log("⚠️ Skipping automatic createTeamVesting to avoid 'Insufficient allowance' (existing VestingVault expects transferFrom).");
        console.log("ℹ️ To proceed, either upgrade VestingVault to version that does not call transferFrom, or run upgrade script provided.");
        console.log(`Wanted vesting beneficiary=${VESTING_BENEFICIARY} amount=${VESTING_AMOUNT} start=${VESTING_START} duration=${VESTING_DURATION}`);
      }
    } else {
      if (!isOwner) console.log("⚠️ Signer not owner — skipping owner-only actions (createTeamVesting / buyback / mint).");
      else if (!VESTING_BENEFICIARY) console.log("⚠️ VESTING_BENEFICIARY not set — skipping createTeamVesting.");
    }
  } catch (err) {
    console.error("❌ Owner check failed:", err?.message ?? err);
  }

  // Final snapshot
  try {
    const finalBalance = await hayq.balanceOf(wallet.address);
    const finalStaked = await hayq.staked(wallet.address);
    const finalAllowance = (MOCK_ROUTER_ADDRESS && MOCK_ROUTER_ADDRESS !== "0x0") ? await hayq.allowance(wallet.address, MOCK_ROUTER_ADDRESS) : 0n;
    console.log("\n--- Final snapshot ---");
    console.log("HAYQ balance:", fmt(finalBalance));
    console.log("Staked:", fmt(finalStaked));
    if (MOCK_ROUTER_ADDRESS) console.log("Allowance to router:", fmt(finalAllowance));
    console.log("----------------------");
  } catch (err) {
    console.error("❌ Final snapshot failed:", err?.message ?? err);
  }

  console.log("\n✅ Script finished.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exitCode = 1;
});
