// src/hooks/useHAYQBalance.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HAYQArtifact from '../../hardhat/artifacts/contracts/HAYQ.sol/HAYQ.json';

export function useHAYQBalance(contractAddress, provider, account) {
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!provider || !contractAddress || !account) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, HAYQArtifact.abi, provider);
      const bal = await contract.balanceOf(account);
      setBalance(ethers.formatUnits(bal, 18));
    } catch (err) {
      console.error('Failed to fetch HAYQ balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [contractAddress, provider, account]);

  return { balance, fetchBalance, loading };
}
