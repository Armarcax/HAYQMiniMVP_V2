// scripts/find-latest-proxy.js
import hre from "hardhat";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

function tryParseJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function gatherProxiesFromOpenZep() {
  const root = path.resolve(process.cwd(), ".openzeppelin");
  if (!fs.existsSync(root)) return [];

  const files = fs.readdirSync(root).filter(f => f.endsWith(".json"));
  const proxies = [];

  for (const f of files) {
    const p = path.join(root, f);
    const json = tryParseJSON(p);
    if (!json) continue;

    // two common shapes used by OZ: "proxies" array or network-specific proxies
    if (Array.isArray(json.proxies)) {
      for (const pr of json.proxies) {
        // try to normalize: address + maybe timestamp or deployTx
        proxies.push({
          address: (pr.address || pr.proxy || pr.proxyAddress || pr.proxy_address || "").toString(),
          meta: pr,
          source: p
        });
      }
    }

    // Some network files have a mapping: { "proxies": { "<network>": [...] } } or different shapes.
    // Let's walk object to find any arrays with objects that look like { address: "0x..." }
    function walk(obj) {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) {
        for (const el of obj) {
          if (el && typeof el === "object" && (el.address || el.proxy || el.proxyAddress)) {
            proxies.push({
              address: (el.address || el.proxy || el.proxyAddress).toString(),
              meta: el,
              source: p
            });
          } else {
            walk(el);
          }
        }
      } else {
        for (const k of Object.keys(obj)) {
          walk(obj[k]);
        }
      }
    }
    walk(json);
  }

  // filter valid-looking addresses and uniq
  const seen = new Set();
  const out = [];
  for (const item of proxies) {
    const a = (item.address || "").toString();
    if (!a || !a.startsWith("0x") || a.length !== 42) continue;
    if (seen.has(a.toLowerCase())) continue;
    seen.add(a.toLowerCase());
    out.push(item);
  }
  return out;
}

async function main() {
  // 1) If user set env HAYQ_CONTRACT_ADDRESS use it immediately
  if (process.env.HAYQ_CONTRACT_ADDRESS && process.env.HAYQ_CONTRACT_ADDRESS.startsWith("0x") && process.env.HAYQ_CONTRACT_ADDRESS.length === 42) {
    console.log("Using HAYQ_CONTRACT_ADDRESS from .env:", process.env.HAYQ_CONTRACT_ADDRESS);
    await showContractInfo(process.env.HAYQ_CONTRACT_ADDRESS);
    return;
  }

  // 2) Try to discover from .openzeppelin
  const proxies = gatherProxiesFromOpenZep();
  if (proxies.length === 0) {
    console.log("No proxies found in .openzeppelin. Please set HAYQ_CONTRACT_ADDRESS in .env or check your .openzeppelin folder.");
    return;
  }

  console.log("Found proxies in .openzeppelin (most likely order):");
  proxies.forEach((p, i) => {
    console.log(`${i + 1}. ${p.address}  (source: ${path.basename(p.source)})`);
  });

  // Heuristic: choose the last one found (most recent in file walk). You can change logic to sort by meta.timestamp if available.
  const chosen = proxies[proxies.length - 1].address;
  console.log("\n→ Choosing latest proxy (heuristic):", chosen);

  await showContractInfo(chosen);
}

async function showContractInfo(proxyAddress) {
  const provider = hre.ethers.provider;

  // use signer from PRIVATE_KEY (if set) for calls requiring signer; read-only calls work without signer too
  const signer = process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.startsWith("0x")
    ? new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider)
    : provider; // provider as fallback (read-only)

  const contract = await hre.ethers.getContractAt("HAYQMiniMVP", proxyAddress, signer);
  try {
    const owner = await contract.owner();
    console.log("Contract owner():", owner);
  } catch (e) {
    console.log("Could not read owner():", e.message ? e.message : e);
  }

  // if we have the upgrades plugin available, print implementation address too (useful)
  try {
    if (hre.upgrades && typeof hre.upgrades.erc1967 !== "undefined" && typeof hre.upgrades.erc1967.getImplementationAddress === "function") {
      const impl = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
      if (impl) console.log("Implementation address (erc1967):", impl);
    } else {
      // try using upgrades-core fallback if installed
      try {
        const { getImplementationAddress } = await import("@openzeppelin/upgrades-core");
        const impl = await getImplementationAddress(hre.ethers.provider, proxyAddress);
        if (impl) console.log("Implementation address (upgrades-core):", impl);
      } catch (_) {
        // ignore
      }
    }
  } catch (e) {
    console.log("Could not get implementation address:", e.message || e);
  }

  // finally provide instructions / ready to continue
  console.log("\nIf this is the proxy you want to operate on, set HAYQ_CONTRACT_ADDRESS in your .env to this address or pass it into subsequent scripts.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exitCode = 1;
});
