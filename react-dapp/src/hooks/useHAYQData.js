// src/hooks/useHAYQData.jsx
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import HAYQMiniMVPAbi from '../../hardhat/artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json';
import { useWallet } from '../context/WalletContext';

export function useHAYQData(contractAddress, onAprHistory) {
  const { provider, account } = useWallet();

  const [balance, setBalance] = useState('0');
  const [staked, setStaked] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [apr, setApr] = useState(0);
  const [stakingRatio, setStakingRatio] = useState(0);
  const [vesting, setVesting] = useState({
    total: '0',
    vested: '0',
    released: '0',
  });

  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!provider || !account || !contractAddress) return;
    setLoading(true);

    try {
      const contract = new ethers.Contract(
        contractAddress,
        HAYQMiniMVPAbi.abi,
        provider
      );

      const [
        b,
        s,
        vTotal,
        vVested,
        vReleased,
        supply
      ] = await Promise.all([
        contract.balanceOf(account),
        contract.stakedBalanceOf(account),
        contract.vestingTotal(account),
        contract.vestedAmount(account),
        contract.releasedAmount(account),
        contract.totalSupply()
      ]);

      // Convert units
      const bal = ethers.formatUnits(b, 18);
      const stk = ethers.formatUnits(s, 18);
      const tSupply = ethers.formatUnits(supply, 18);

      setBalance(bal);
      setStaked(stk);
      setTotalSupply(tSupply);

      setVesting({
        total: ethers.formatUnits(vTotal, 18),
        vested: ethers.formatUnits(vVested, 18),
        released: ethers.formatUnits(vReleased, 18),
      });

      // --- APR CALC ---
      const stBig = BigInt(s.toString());
      const tsBig = BigInt(supply.toString());

      const aprValue =
        tsBig > 0n
          ? Number((stBig * 10000n) / tsBig) / 100
          : 0;

      setApr(aprValue);

      if (onAprHistory) {
        onAprHistory({
          time: new Date().toLocaleTimeString(),
          value: aprValue,
        });
      }

      // --- Staking Ratio ---
      const calculatedRatio =
        tsBig > 0n
          ? Number((stBig * 10000n) / tsBig) / 100
          : 0;

      setStakingRatio(calculatedRatio);

    } catch (err) {
      console.error("useHAYQData error:", err);
    } finally {
      setLoading(false);
    }
  }, [provider, account, contractAddress, onAprHistory]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return {
    balance,
    staked,
    apr,
    stakingRatio,
    vesting,
    totalSupply,
    fetchAll,
    loading
  };
}
