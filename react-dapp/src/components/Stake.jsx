// src/components/Stake.jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import HAYQAbi from '../abis/HAYQ.json';

function Stake({ contractAddress }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const stakeTokens = async () => {
    if (!window.ethereum || !contractAddress) return;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert(t("enterValidAmount"));
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, HAYQAbi, signer);

      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await contract.stake(parsedAmount);
      await tx.wait();

      alert(t('stakeSuccess'));
      setAmount('');
    } catch (err) {
      console.error(err);
      alert(t('stakeFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h3>{t("stakeHAYQ")}</h3>
      <input
        placeholder={t("amount")}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        disabled={loading}
      />
      <button className="primary" onClick={stakeTokens} disabled={loading}>
        {loading ? t("processing") : t("stake")}
      </button>
    </div>
  );
}

export default Stake;
