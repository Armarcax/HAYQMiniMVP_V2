import { run } from "hardhat";

async function main() {
  await run("verify:verify", {
    address: "0xa1Bbf04d7ED7a64eE4E4324259AB31E01bEAf0BA",
    constructorArguments: [
      ["0x928677743439e4dA4108c4025694B2F3d3b2745c","0x538d6965C48BF85379328585bbA482E574b0Ed59"],
      2
    ],
  });
}

main().catch(console.error);
