// src/components/Charts.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

// ===== Simulated Data =====
const liveAPRData = [
  { month: "Jan", value: 0 },
  { month: "Feb", value: 45 },
  { month: "Mar", value: 90 },
  { month: "Apr", value: 135 },
  { month: "May", value: 180 },
  { month: "Jun", value: 135 },
];

const dividendData = [
  { name: "Holders", dividend: 12 },
  { name: "Contract", dividend: 8 },
  { name: "Reserved", dividend: 5 },
];

const growthData = [
  { quarter: "Q1", growth: 7 },
  { quarter: "Q2", growth: 14 },
  { quarter: "Q3", growth: 21 },
  { quarter: "Q4", growth: 28 },
];

// ===== Components =====
export const LiveChart = ({ data = liveAPRData }) => (
  <div className="component">
    <h3>Staking Ratio % (Simulated)</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#0033A0" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const DividendChart = ({ data = dividendData }) => (
  <div className="component">
    <h3>Dividend Distribution</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="dividend" fill="#D90012" />
      </BarChart>
    </ResponsiveContainer>
    <p className="small-text">
      Dividends tracked by ERC20 & ETH DividendTracker contracts. Proportional to HAYQ holders. Integration ready.
    </p>
  </div>
);

export const GrowthChart = ({ data = growthData }) => (
  <div className="component">
    <h3>Economic Growth Rate (Annual 25%)</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="quarter" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="growth" fill="#F2A800" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
