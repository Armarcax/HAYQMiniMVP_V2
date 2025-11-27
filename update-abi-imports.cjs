const fs = require("fs");
const path = require("path");

console.log("🚀 Starting ABI sync + import fix...\n");

// 1) SOURCE ABI (Hardhat output)
const SOURCE_ABI = path.join(
  __dirname,
  "hardhat",
  "artifacts",
  "contracts",
  "HAYQMiniMVP.sol",
  "HAYQMiniMVP.json"
);

// 2) DEST ABI (React)
const DEST_DIR = path.join(__dirname, "src", "abis");
const DEST_ABI = path.join(DEST_DIR, "HAYQMiniMVP.json");

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
  console.log(`📁 Created directory: ${DEST_DIR}`);
}

// Copy ABI
if (fs.existsSync(SOURCE_ABI)) {
  fs.copyFileSync(SOURCE_ABI, DEST_ABI);
  console.log(`✔️ ABI updated: ${DEST_ABI}\n`);
} else {
  console.log("❌ ABI source file NOT FOUND!\n");
  process.exit(1);
}

// Target folders
const TARGET_DIRS = [
  path.join(__dirname, "src", "hooks"),
  path.join(__dirname, "src", "components")
];

// 3) Replace import paths in JS/JSX
TARGET_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".js") || f.endsWith(".jsx"));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, "utf8");

    // Compute relative path automatically
    const relativePath = path.relative(path.dirname(filePath), DEST_ABI).replace(/\\/g, "/");

    const newImport = `import HAYQMiniMVPAbi from "${relativePath}";`;

    // Remove ANY previous ABI import
    const updated = content
      .replace(/import\s+.*?from\s+["'].*HAYQ.*?["'];?/g, "")
      .replace(/\n\s*\n/, "\n") // remove empty lines
      .replace(/export default/, `${newImport}\n\nexport default`);

    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`🔧 Updated imports in: ${file}`);
  });
});

console.log("\n🎉 Done! ABI synced & imports fixed.");
