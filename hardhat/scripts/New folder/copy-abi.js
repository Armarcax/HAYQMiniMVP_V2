// scripts/copyAbi.js
const fs = require("fs");
const path = require("path");

try {
  // Source path → compilation artifacts
  const srcPath = path.resolve(__dirname, "../artifacts/contracts/HAYQ.sol/HAYQ.json");
  // Destination path → React DApp
  const destPath = path.resolve(__dirname, "../react-dapp/src/abis/HAYQ.json");

  // Ստուգել և ստեղծել folder, եթե չկա
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  // Copy the ABI file
  fs.copyFileSync(srcPath, destPath);
  console.log("✅ ABI copied successfully to react-dapp/src/abis/HAYQ.json");
} catch (err) {
  console.error("❌ Failed to copy ABI:", err);
  process.exit(1);
}
