// src/components/Balance.jsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import HAYQAbi from '../abis/HAYQ.json';

function Balance({ contractAddress, account }) {
  const { t } = useTranslation();
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!window.ethereum || !contractAddress || !account) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, HAYQAbi, provider);
      const bal = await contract.balanceOf(account);
      setBalance(ethers.formatUnits(bal, 18));
    } catch (err) {
      console.error(err);
      alert(t('walletError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // ավտոմատ թարմացում 30 վայրկյանից մեկ
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [contractAddress, account]);

  return (
    <div className="component">
      <h3>{t("balance")}</h3>
      <p>{loading ? t("loading") : `${balance} HAYQ`}</p>
      <button className="primary" onClick={fetchBalance}>{t("refresh")}</button>
    </div>
  );
}

export default Balance;
