// scripts/show-etherscan-buttons.js
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const NETWORK = process.env.HARDHAT_NETWORK || "sepolia";
const ETHERSCAN_BASE =
  NETWORK === "sepolia"
    ? "https://sepolia.etherscan.io"
    : "https://etherscan.io";

function readEnvFile(path) {
  if (!fs.existsSync(path)) {
    console.error(`❌ File not found: ${path}`);
    process.exit(1);
  }
  const lines = fs.readFileSync(path, "utf-8").split("\n");
  const obj = {};
  lines.forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith("#")) return;
    const [key, val] = line.split("=");
    if (key && val) obj[key] = val.trim();
  });
  return obj;
}

async function main() {
  console.log(`🔎 Reading deployed addresses from env for network: ${NETWORK}...\n`);

  const envFile = `./env-ready-buttons.env`;
  const addresses = readEnvFile(envFile);

  for (const [key, addr] of Object.entries(addresses)) {
    const readUrl = `${ETHERSCAN_BASE}/address/${addr}#readProxyContract`;
    const writeUrl = `${ETHERSCAN_BASE}/address/${addr}#writeProxyContract`;
    console.log(`✅ ${key}: ${addr}`);
    console.log(`   🔗 Read as Proxy: ${readUrl}`);
    console.log(`   ✏️ Write as Proxy: ${writeUrl}\n`);
  }

  console.log(`📁 All addresses read from: ${envFile}`);
  console.log("✅ Done! You can click the above links to access Read/Write as Proxy in Etherscan.");
}

main();
