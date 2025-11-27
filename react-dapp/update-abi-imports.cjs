const fs = require("fs");
const path = require("path");

console.log("🔍 Fixing HAYQMiniMVP ABI imports...");

const TARGET_IMPORT = /from ['"]\.{1,2}\/\.{1,2}\/hardhat\/artifacts\/contracts\/HAYQMiniMVP\.sol\/HAYQMiniMVP\.json['"]/g;

const CORRECT_IMPORT = `from "../abis/HAYQMiniMVP.json"`;

// Make sure the ABI exists in src/abis
const projectRoot = process.cwd();
const abiSource = path.join(projectRoot, "hardhat/artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json");
const abiDest = path.join(projectRoot, "src/abis/HAYQMiniMVP.json");

if (!fs.existsSync(abiDest)) {
    console.log("📁 Copying ABI to src/abis...");
    if (!fs.existsSync(path.dirname(abiDest))) {
        fs.mkdirSync(path.dirname(abiDest), { recursive: true });
    }
    fs.copyFileSync(abiSource, abiDest);
    console.log("✔️ ABI copied to src/abis/HAYQMiniMVP.json");
} else {
    console.log("✔️ ABI already exists in src/abis/");
}

// Scan src/components and src/hooks
const foldersToScan = [
    path.join(projectRoot, "src/components"),
    path.join(projectRoot, "src/hooks")
];

foldersToScan.forEach((folder) => {
    if (!fs.existsSync(folder)) return;

    const files = fs.readdirSync(folder).filter((f) => f.endsWith(".jsx") || f.endsWith(".js"));

    for (const file of files) {
        const filePath = path.join(folder, file);
        let content = fs.readFileSync(filePath, "utf8");

        if (content.match(TARGET_IMPORT)) {
            console.log(`✏️ Updating import in ${file}`);
            content = content.replace(TARGET_IMPORT, CORRECT_IMPORT);
            fs.writeFileSync(filePath, content);
        }
    }
});

console.log("🎉 Done! All imports fixed.");
