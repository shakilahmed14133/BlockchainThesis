import React, { useState } from "react";

import { create } from "ipfs-http-client";
import Web3 from "web3";
import FileStorageABI from "./contracts/FileStorage.json";

const ipfs = create({ url: "http://localhost:5001/api/v0" });
import FileUpload from "./FileUpload";
import LoginRegister from "./LoginRegister";

const loadBlockchainData = async () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId();
    const networkData = FileStorageABI.networks[networkId];

    if (networkData) {
      const fileContract = new web3.eth.Contract(FileStorageABI.abi, networkData.address);
      setContract(fileContract);
      fetchFiles(fileContract, accounts[0]);
    } else {
      console.error("Smart contract not deployed on this network.");
      alert("Please deploy the contract and restart the app.");
    }
  } else {
    alert("Please install MetaMask!");
  }
};
const App = () => {
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem("loggedInUser"));

  const handleLogin = (username) => {
    setLoggedInUser(username);
    localStorage.setItem("loggedInUser", username);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("loggedInUser");
  };

  return (
    <div>
      {loggedInUser ? (
        <div>
          <div style={{ textAlign: "right", padding: "10px" }}>
            <span style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#2c3e50",
              backgroundColor: "#e8f0fe",
              padding: "6px 12px",
              borderRadius: "20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              marginRight: "10px",
            }}>Welcome, {loggedInUser} </span>
            <button style={{
              padding: "6px 14px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "#ff4d4f",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }} onClick={handleLogout} >
              Logout
            </button>
          </div>
          <FileUpload />
        </div>
      ) : (
        <LoginRegister onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
