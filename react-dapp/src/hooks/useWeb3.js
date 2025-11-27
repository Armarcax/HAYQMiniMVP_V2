// src/hooks/useWeb3.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useWeb3() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  const connect = async () => {
    if (!window.ethereum) {
      alert('Install MetaMask!');
      return;
    }
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      const signer = await web3Provider.getSigner();
      const acc = await signer.getAddress();
      setAccount(acc);

      const network = await web3Provider.getNetwork();
      setChainId(network.chainId);

      window.ethereum.on('accountsChanged', async (accounts) => {
        setAccount(accounts[0] || null);
      });
      window.ethereum.on('chainChanged', async (chainIdHex) => {
        const id = parseInt(chainIdHex, 16);
        setChainId(id);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return { provider, account, chainId, connect };
}
