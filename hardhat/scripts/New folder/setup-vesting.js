// scripts/setup-vesting.js (թարմացված)
import hre from "hardhat";

async function main() {
  const NEW_HAYQ_PROXY = "0xc0132DB1835b9C53347ab628185165A81cCb848F";
  const MULTISIG = "0xb6455830aD60bB16A4f833D4e83cEe1bB2B9DE75";
  const VESTING = "0xd17d1423DFd6c49932fFB8B5ebb61035BdCC48c6";

  const multisig = await hre.ethers.getContractAt("MultiSigTimelock", MULTISIG);
  const iface = new hre.ethers.Interface(["function setVestingVault(address)"]);
  const data = iface.encodeFunctionData("setVestingVault", [VESTING]);

  // Submit (միայն առաջին անգամ)
  // await multisig.submit(NEW_HAYQ_PROXY, 0, data);
  // console.log("✅ Submitted setVestingVault");

  // Confirm (միայն առաջին անգամ)
  // await multisig.confirm(0);
  // console.log("✅ Confirmed");

  // Execute (միշտ կարելի է կրկնել, եթե ձախողվի)
  await new Promise(r => setTimeout(r, 5000));
  await multisig.execute(0);
  console.log("✅ VestingVault is set!");
}

main();