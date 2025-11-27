import { ethers } from "ethers";
import HAYQAbi from "../abis/HAYQ.json";

export async function getContract(contractAddress) {
  if (!window.ethereum || !contractAddress) return null;

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, HAYQAbi, signer);
}
