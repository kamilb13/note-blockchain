import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

const contractAddress = "0x74A5b741E03782232c5f9e4629567c041FF163ED";
const contractABI = [
  {
    inputs: [{ internalType: "string", name: "_tresc", type: "string" }],
    name: "dodajNotatke",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "autor",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "tresc", type: "string" },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "NowaNotatka",
    type: "event",
  },
  {
    inputs: [],
    name: "liczbaNotatek",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "start", type: "uint256" },
      { internalType: "uint256", name: "limit", type: "uint256" },
    ],
    name: "pobierzNotatki",
    outputs: [
      {
        components: [
          { internalType: "address", name: "autor", type: "address" },
          { internalType: "string", name: "tresc", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct Notatnik.Notatka[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [notatki, setNotatki] = useState([]);
  const [tresc, setTresc] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        const signer = await web3Provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(contractInstance);
        loadNotatki(contractInstance);
      } else {
        alert("Proszę zainstalować MetaMask!");
      }
    };
    init();
  }, []);

  const loadNotatki = async (contractInstance) => {
    try {
      const liczbaNotatek = await contractInstance.liczbaNotatek();
      const notatkiData = await contractInstance.pobierzNotatki(
        Number(liczbaNotatek) - 5,
        liczbaNotatek
      );
      const parsedNotatki = notatkiData.map((notatka) => ({
        autor: notatka.autor,
        tresc: notatka.tresc,
        timestamp: Number(notatka.timestamp),
      }));
      setNotatki(parsedNotatki);
    } catch (error) {
      console.error("Błąd podczas ładowania notatek:", error);
    }
  };

  const handleDodajNotatke = async () => {
    if (tresc.trim()) {
      try {
        const tx = await contract.dodajNotatke(tresc);
        await tx.wait();
        loadNotatki(contract);
        setTresc("");
      } catch (error) {
        console.error("Błąd przy dodawaniu notatki:", error);
      }
    }
  };

  return (
    <div className="container">
      <h1 style={{ paddingTop: "150px" }}>Notatnik</h1>
      {account ? (
        <div>
          <p className="wallet">Połączono z portfelem: {account}</p>
          <div className="note-input">
            <textarea
              value={tresc}
              onChange={(e) => setTresc(e.target.value)}
              placeholder="Wpisz swoją notatkę..."
              rows="4"
            />
            <button onClick={handleDodajNotatke}>Dodaj Notatkę</button>
          </div>
          <h2>Lista Notatek</h2>
          <ul className="note-list">
            {notatki.map((notatka, index) => (
              <li key={index} className="note-item">
                <p className="author">Autor: {notatka.autor}</p>
                <p className="content">{notatka.tresc}</p>
                <p className="timestamp">
                  {new Date(notatka.timestamp * 1000).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="wallet-warning">Proszę połączyć portfel MetaMask</p>
      )}
    </div>
  );
}

export default App;
