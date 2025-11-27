// scripts/check-balance.js
import hre from "hardhat";

async function main() {
  const HAYQ_PROXY = "0xc0132DB1835b9C53347ab628185165A81cCb848F";
  const ACCOUNT = "0x928677743439e4dA4108c4025694B2F3d3b2745c";

  const hayq = await hre.ethers.getContractAt("HAYQMiniMVP", HAYQ_PROXY);
  const balance = await hayq.balanceOf(ACCOUNT);

  console.log("HAYQ Balance:", hre.ethers.formatUnits(balance, 18), "HAYQ");
}

main();