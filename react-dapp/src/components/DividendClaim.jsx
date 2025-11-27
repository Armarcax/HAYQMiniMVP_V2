// src/components/DividendClaim.jsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import HAYQAbi from '../abis/HAYQ.json';
import { useTranslation } from 'react-i18next';

function DividendClaim({ contractAddress, account }) {
  const { t } = useTranslation();
  const [withdrawable, setWithdrawable] = useState("0");
  const [loading, setLoading] = useState(false);

  const fetchWithdrawable = async () => {
    if (!window.ethereum || !contractAddress || !account) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, HAYQAbi, provider);
      // Արդեն գոյություն ունեցող ֆունկցիա. Եթե MiniMVP–ն վերադարձնում է դիվիդենտ
      const amount = await contract.vestingReleased(account); 
      setWithdrawable(ethers.formatUnits(amount, 18));
    } catch(err) {
      console.error("Failed to fetch withdrawable dividend:", err);
      setWithdrawable("0");
    }
  };

  const claim = async () => {
    if (!window.ethereum || !contractAddress) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, HAYQAbi, signer);
      // Կոչենք արդեն գոյություն ունեցող withdraw ֆունկցիան
      const tx = await contract.withdrawDividend?.(); 
      if(tx) await tx.wait();
      alert(t('dividendsClaimed'));
      await fetchWithdrawable();
    } catch(err) {
      console.error(err);
      alert(t('claimFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawable();
    const interval = setInterval(fetchWithdrawable, 30000);
    return () => clearInterval(interval);
  }, [contractAddress, account]);

  return (
    <div className="component">
      <h3>{t('claimDividends')}</h3>
      <p>{t('withdrawable')}: {withdrawable} HAYQ</p>
      <button className="primary" onClick={claim} disabled={loading}>
        {loading ? t('processing') : t('claim')}
      </button>
      <button className="secondary" onClick={fetchWithdrawable}>{t('refresh')}</button>
    </div>
  );
}

export default DividendClaim;
