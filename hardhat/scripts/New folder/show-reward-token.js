// scripts/show-reward-token.js
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🔎 Reading REWARD_TOKEN_ADDRESS from .env...\n");

  const rewardAddress = process.env.REWARD_TOKEN_ADDRESS;

  if (!rewardAddress || rewardAddress === "" || rewardAddress.includes("<")) {
    console.log("❌ REWARD_TOKEN_ADDRESS not set in .env");
    console.log("Please deploy MockERC20 and update your .env file.");
    return;
  }

  console.log(`✅ REWARD_TOKEN_ADDRESS: ${rewardAddress}`);

  // Ընտրովի․ պահպանել նոր ֆայլում
  const envPath = "./reward-token.env";
  fs.writeFileSync(envPath, `REWARD_TOKEN_ADDRESS=${rewardAddress}\n`);
  console.log(`📄 Env-ready address saved to: ${envPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
