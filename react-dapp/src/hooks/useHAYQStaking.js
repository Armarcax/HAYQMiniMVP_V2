// src/hooks/useHAYQStaking.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HAYQStakingArtifact from '../../hardhat/artifacts/contracts/HAYQStakingUpgradeable.sol/HAYQStakingUpgradeable.json';

export function useHAYQStaking(contractAddress, provider, account) {
  const [staked, setStaked] = useState('0');
  const [pendingReward, setPendingReward] = useState('0');
  const [loading, setLoading] = useState(false);

  const fetchStaked = async () => {
    if (!provider || !contractAddress || !account) return;
    try {
      const contract = new ethers.Contract(contractAddress, HAYQStakingArtifact.abi, provider);
      const s = await contract.stakes(account);
      setStaked(ethers.formatUnits(s.amount, 18));

      const reward = await contract.getPendingReward(account);
      setPendingReward(ethers.formatUnits(reward, 18));
    } catch (err) {
      console.error(err);
    }
  };

  const stake = async (amount) => {
    if (!provider || !contractAddress || !account) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, HAYQStakingArtifact.abi, provider);
      const signer = provider.getSigner();
      const tx = await contract.connect(signer).stake(ethers.parseUnits(amount.toString(), 18));
      await tx.wait();
      fetchStaked();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unstake = async () => {
    if (!provider || !contractAddress || !account) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, HAYQStakingArtifact.abi, provider);
      const signer = provider.getSigner();
      const tx = await contract.connect(signer).unstake();
      await tx.wait();
      fetchStaked();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaked();
  }, [contractAddress, provider, account]);

  return { staked, pendingReward, stake, unstake, fetchStaked, loading };
}
