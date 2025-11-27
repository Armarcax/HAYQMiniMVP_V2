import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Install MetaMask');
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const p = new ethers.BrowserProvider(window.ethereum);
      const signer = p.getSigner();
      const acc = await signer.getAddress();
      setProvider(p);
      setAccount(acc);

      const network = await p.getNetwork();
      setChainId(network.chainId);

      // Հաշվի փոփոխության և ցանցի փոփոխության հետևում
      window.ethereum.on('accountsChanged', async (accounts) => {
        setAccount(accounts[0] || '');
      });
      window.ethereum.on('chainChanged', async (chainIdHex) => {
        setChainId(parseInt(chainIdHex, 16));
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WalletContext.Provider value={{ provider, account, chainId, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
