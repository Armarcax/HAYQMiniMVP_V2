// src/components/EconomicGrowth.jsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import HAYQAbi from '../abis/HAYQMiniMVP.json';
import { useTranslation } from 'react-i18next';

function EconomicGrowth({ contractAddress, account, provider, signer, onAprUpdate, onChartData }) {
  const [apr, setApr] = useState(0);
  const [history, setHistory] = useState([]); // NEW → Live chart history storage
  const { t } = useTranslation();

  const fetchAPR = async () => {
    if (!window.ethereum || !contractAddress || !account) return;

    try {
      const contract = new ethers.Contract(contractAddress, HAYQAbi, provider || signer);

      if (typeof contract.stakedBalanceOf !== 'function' || typeof contract.totalSupply !== 'function') {
        console.warn("Contract functions missing: stakedBalanceOf or totalSupply");
        setApr(0);
        if (onAprUpdate) onAprUpdate(0);
        return;
      }

      const stakedRaw = await contract.stakedBalanceOf(account);
      const totalSupplyRaw = await contract.totalSupply();

      const staked = typeof stakedRaw === 'bigint' ? stakedRaw : BigInt(stakedRaw.toString());
      const totalSupply = typeof totalSupplyRaw === 'bigint' ? totalSupplyRaw : BigInt(totalSupplyRaw.toString());

      const aprValue = totalSupply > 0n ? Number(staked * 10000n / totalSupply) / 100 : 0;

      setApr(aprValue);
      if (onAprUpdate) onAprUpdate(aprValue);

      // NEW — append new data point for the LiveChart
      const newPoint = {
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        value: aprValue
      };

      setHistory((prev) => {
        const updated = [...prev, newPoint];
        const trimmed = updated.slice(-30); // keep last 30 data points
        if (onChartData) onChartData(trimmed);
        return trimmed;
      });

    } catch (err) {
      console.error("Failed to fetch APR:", err);
      setApr(0);
      if (onAprUpdate) onAprUpdate(0);
    }
  };

  useEffect(() => {
    fetchAPR();
    const interval = setInterval(fetchAPR, 30000);
    return () => clearInterval(interval);
  }, [contractAddress, account]);

  return (
    <div className="component">
      <h3>{t("economicGrowth")}</h3>
      <p>{apr} %</p>
      <button className="primary" onClick={fetchAPR}>{t("refresh")}</button>
    </div>
  );
}

export default EconomicGrowth;
