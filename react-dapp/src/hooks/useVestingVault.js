// src/hooks/useVestingVault.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VestingVaultArtifact from '../../hardhat/artifacts/contracts/VestingVaultUpgradeable.sol/VestingVaultUpgradeable.json';

export function useVestingVault(contractAddress, provider, account) {
  const [vestingInfo, setVestingInfo] = useState(null);

  const fetchVesting = async () => {
    if (!provider || !contractAddress || !account) return;
    try {
      const contract = new ethers.Contract(contractAddress, VestingVaultArtifact.abi, provider);
      const info = await contract.getVestingInfo(account);
      setVestingInfo({
        total: ethers.formatUnits(info.totalAmount, 18),
        released: ethers.formatUnits(info.released, 18),
        vested: ethers.formatUnits(info.vested, 18),
        start: info.start.toNumber(),
        duration: info.duration.toNumber(),
      });
    } catch (err) {
      console.error('Failed to fetch vesting info:', err);
    }
  };

  useEffect(() => { fetchVesting(); }, [contractAddress, provider, account]);

  return { vestingInfo, fetchVesting };
}
