// src/components/Unstake.jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import HAYQAbi from '../abis/HAYQ.json';

function Unstake({ contractAddress }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const unstakeTokens = async () => {
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
      const tx = await contract.unstake(parsedAmount);
      await tx.wait();

      alert(t("unstakeSuccess"));
      setAmount('');
    } catch (err) {
      console.error(err);
      alert(t("unstakeFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h3>{t("unstakeHAYQ")}</h3>
      <input
        placeholder={t("amount")}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        disabled={loading}
      />
      <button className="primary" onClick={unstakeTokens} disabled={loading}>
        {loading ? t("processing") : t("unstake")}
      </button>
    </div>
  );
}

export default Unstake;
