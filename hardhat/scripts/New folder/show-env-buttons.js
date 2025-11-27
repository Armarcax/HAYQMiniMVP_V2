// scripts/show-env-buttons.js
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const ENV_PATH = ".env";
const OUTPUT_JSON = "./env-buttons.json";
const OUTPUT_ENV = "./env-ready-buttons.env";

console.log("🔎 Reading addresses from .env...");

// Ստեղծում ենք օբյեկտ՝ բոլոր կարևոր հասցեներով
const addresses = {
  HAYQ_CONTRACT_ADDRESS: process.env.HAYQ_CONTRACT_ADDRESS || null,
  REWARD_TOKEN_ADDRESS: process.env.REWARD_TOKEN_ADDRESS || null,
  VESTING_ADDR: process.env.VESTING_ADDR || null,
  ETH_DIV_ADDR: process.env.ETH_DIV_ADDR || null,
  MULTISIG_ADDR: process.env.MULTISIG_ADDR || null,
  MOCK_ROUTER_ADDRESS: process.env.MOCK_ROUTER_ADDRESS || null
};

// Ցույց տալ յուրաքանչյուր հասցե
for (const [key, value] of Object.entries(addresses)) {
  if (value) {
    console.log(`✅ ${key}: ${value}`);
  } else {
    console.log(`❌ ${key} not set in .env`);
  }
}

// Պահպանել JSON
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(addresses, null, 2));

// Պահպանել env-ready ֆայլ
const envContent = Object.entries(addresses)
  .filter(([_, v]) => v) // միայն set values
  .map(([k, v]) => `${k}=${v}`)
  .join("\n");

fs.writeFileSync(OUTPUT_ENV, envContent);

console.log(`\n📁 Addresses saved to JSON: ${OUTPUT_JSON}`);
console.log(`📄 Env-ready addresses saved to: ${OUTPUT_ENV}`);
console.log("\n✅ Done! You can now use these addresses for Read/Write as Proxy in etherscan.");
