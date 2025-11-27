// scripts/open-etherscan-proxies.js
import fs from "fs";
import dotenv from "dotenv";
import open from "open"; // ավտոմատ բացելու համար
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
  console.log(`🚀 Opening all Etherscan proxy interfaces for network: ${NETWORK}\n`);

  const envFile = "./env-ready-buttons.env";
  const addresses = readEnvFile(envFile);

  for (const [key, addr] of Object.entries(addresses)) {
    const readUrl = `${ETHERSCAN_BASE}/address/${addr}#readProxyContract`;
    const writeUrl = `${ETHERSCAN_BASE}/address/${addr}#writeProxyContract`;

    console.log(`✅ ${key}: ${addr}`);
    console.log(`   🔗 Read as Proxy: ${readUrl}`);
    console.log(`   ✏️ Write as Proxy: ${writeUrl}`);

    await open(readUrl);
    await open(writeUrl);
  }

  console.log("\n✅ All proxy pages opened in your browser!");
}

main();
