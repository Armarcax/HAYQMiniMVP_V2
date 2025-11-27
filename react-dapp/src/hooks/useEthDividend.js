// src/hooks/useEthDividend.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import EthDividendArtifact from '../../hardhat/artifacts/contracts/EthDividendTrackerUpgradeable.sol/EthDividendTrackerUpgradeable.json';

export function useEthDividend(contractAddress, provider, account) {
  const [withdrawable, setWithdrawable] = useState('0');
  const [loading, setLoading] = useState(false);

  const fetchWithdrawable = async () => {
    if (!provider || !contractAddress || !account) return;
    try {
      const contract = new ethers.Contract(contractAddress, EthDividendArtifact.abi, provider);
      const amount = await contract.withdrawableDividendOf(account);
      setWithdrawable(ethers.formatEther(amount));
    } catch (err) {
      console.error('Failed to fetch withdrawable dividend:', err);
    }
  };

  const withdraw = async () => {
    if (!provider || !contractAddress || !account) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, EthDividendArtifact.abi, provider);
      const signer = provider.getSigner();
      const tx = await contract.connect(signer).withdrawDividend();
      await tx.wait();
      fetchWithdrawable();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawable();
  }, [contractAddress, provider, account]);

  return { withdrawable, withdraw, fetchWithdrawable, loading };
}
