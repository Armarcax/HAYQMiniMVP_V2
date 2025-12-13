// src/components/EconomicGrowth.jsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import HAYQAbi from '../abis/HAYQMiniMVP.json';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function EconomicGrowth({ contractAddress, account, provider, signer, onAprUpdate, onChartData }) {
  const [apr, setApr] = useState(0);
  const [history, setHistory] = useState([]); // Live chart history
  const [quarterGrowth, setQuarterGrowth] = useState([0,0,0,0]);
  const { t } = useTranslation();

  // Fetch APR and Quarterly Growth
  const fetchAPR = async () => {
    if (!window.ethereum || !contractAddress || !account) return;

    try {
      const contract = new ethers.Contract(contractAddress, HAYQAbi, provider || signer);

      if (typeof contract.stakedBalanceOf !== 'function' || typeof contract.totalSupply !== 'function') {
        console.warn("Contract missing functions: stakedBalanceOf or totalSupply");
        setApr(0);
        if (onAprUpdate) onAprUpdate(0);
        return;
      }

      // --- APR Calculation ---
      const stakedRaw = await contract.stakedBalanceOf(account);
      const totalSupplyRaw = await contract.totalSupply();
      const staked = typeof stakedRaw === 'bigint' ? stakedRaw : BigInt(stakedRaw.toString());
      const totalSupply = typeof totalSupplyRaw === 'bigint' ? totalSupplyRaw : BigInt(totalSupplyRaw.toString());
      const aprValue = totalSupply > 0n ? Number(staked * 10000n / totalSupply) / 100 : 0;

      setApr(aprValue);
      if (onAprUpdate) onAprUpdate(aprValue);

      const newPoint = {
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        value: aprValue
      };

      setHistory(prev => {
        const updated = [...prev, newPoint].slice(-30); // Keep last 30 points
        if (onChartData) onChartData(updated);
        return updated;
      });

      // --- Quarterly Growth Simulation (replace with real contract calls if available) ---
      const qGrowth = [Math.random()*7, Math.random()*7, Math.random()*7, Math.random()*7]; // 0-7% Q1-Q4
      setQuarterGrowth(qGrowth);

    } catch (err) {
      console.error("Failed to fetch APR or Growth:", err);
      setApr(0);
      if (onAprUpdate) onAprUpdate(0);
    }
  };

  useEffect(() => {
    fetchAPR();
    const interval = setInterval(fetchAPR, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [contractAddress, account]);

  return (
    <div className="component">
      <h3>{t("economicGrowth")}</h3>
      <p>APR: {apr.toFixed(2)} %</p>
      <button className="primary" onClick={fetchAPR}>{t("refresh")}</button>

      {/* --- Live APR Chart --- */}
      {history.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#0033A0" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* --- Quarterly Growth Chart --- */}
      {quarterGrowth && quarterGrowth.length === 4 && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={quarterGrowth.map((v, i) => ({ quarter: `Q${i+1}`, growth: v }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="growth" stroke="#F2A800" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default EconomicGrowth;
