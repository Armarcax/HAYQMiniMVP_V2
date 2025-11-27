import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HAYQMiniMVPAbi from '../../hardhat/artifacts/contracts/HAYQMiniMVP.sol/HAYQMiniMVP.json';
import { useWallet } from '../context/WalletContext';

export function useHAYQMiniMVP(contractAddress) {
  const { provider, account } = useWallet();
  const [balance, setBalance] = useState('0');
  const [staked, setStaked] = useState('0');
  const [vesting, setVesting] = useState({ total:'0', released:'0', vested:'0' });
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    if (!provider || !account || !contractAddress) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, HAYQMiniMVPAbi.abi, provider);
      const [b, s, vInfo] = await Promise.all([
        contract.balanceOf(account),
        contract.stakedBalanceOf(account),
        contract.vestingTotal(account)
      ]);
      setBalance(ethers.formatUnits(b, 18));
      setStaked(ethers.formatUnits(s, 18));
      setVesting({ total: ethers.formatUnits(vInfo, 18), released:'0', vested:'0' });
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [provider, account, contractAddress]);

  return { balance, staked, vesting, fetchAll, loading };
}
