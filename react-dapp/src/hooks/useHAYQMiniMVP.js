// src/hooks/useHAYQMiniMVP.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HAYQMiniMVPArtifact from '../../hardhat/artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json';

export function useHAYQMiniMVP(contractAddress, provider, account) {
  const [balance, setBalance] = useState('0');
  const [staked, setStaked] = useState('0');
  const [vesting, setVesting] = useState({ total: '0', released: '0', vested: '0' });
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    if (!provider || !account) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, HAYQMiniMVPArtifact.abi, provider);
      const [b, s, vInfo] = await Promise.all([
        contract.balanceOf(account),
        contract.stakedBalanceOf(account),
        contract.vestingTotal(account) // եթե getVestingInfo է հարկավոր, փոխիր այստեղ
      ]);

      setBalance(ethers.formatUnits(b, 18));
      setStaked(ethers.formatUnits(s, 18));
      setVesting({
        total: ethers.formatUnits(vInfo.totalAmount || vInfo, 18),
        released: ethers.formatUnits(vInfo.released || 0, 18),
        vested: ethers.formatUnits(vInfo.vested || 0, 18)
      });
    } catch (err) {
      console.error('Failed to fetch HAYQMiniMVP data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [contractAddress, provider, account]);

  return { balance, staked, vesting, fetchAll, loading };
}
