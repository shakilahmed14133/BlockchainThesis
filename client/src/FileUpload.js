// src/FileUpload.js
import React, { useState, useEffect } from "react";
import { create } from "ipfs-http-client";
import Web3 from "web3";
import FileStorageABI from "./contracts/FileStorage.json";
import "./FileUpload.css";

const ipfs = create({ url: "http://localhost:5001/api/v0" });

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [activeView, setActiveView] = useState("upload");

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  useEffect(() => {
    setFilteredFiles(
      uploadedFiles.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, uploadedFiles]);

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

  const fetchFiles = async (fileContract, userAccount) => {
    const files = await fileContract.methods.getFiles(userAccount).call();
    setUploadedFiles(files);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadToIPFS = async () => {
    if (!file) return alert("Please select a file");
    if (!contract) return alert("Smart contract not loaded. Try refreshing the page.");

    try {
      const added = await ipfs.add(file);
      const cid = added.path;
      const fileName = file.name;
      const timestamp = Date.now();

      await contract.methods.uploadFile(cid, fileName).send({ from: account });

      setUploadedFiles([...uploadedFiles, { cid, name: fileName, timestamp }]);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const deleteFile = async (index) => {
    if (!contract) return alert("Smart contract not loaded. Try refreshing the page.");

    try {
      await contract.methods.deleteFile(index).send({ from: account });
      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file from blockchain.");
    }
  };

  return (
    <div className="upload-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>File DApp</h2>
        <button
          className={`sidebar-link ${activeView === "upload" ? "active" : ""}`}
          onClick={() => setActiveView("upload")}
        >
          Upload File
        </button>
        <button
          className={`sidebar-link ${activeView === "view" ? "active" : ""}`}
          onClick={() => setActiveView("view")}
        >
          View Files
        </button>
        <div className="sidebar-footer">
          <p>{account ? `🟢 ${account.slice(0, 6)}...${account.slice(-4)}` : "🔴 Not connected"}</p>
        </div>
      </div>
  
      {/* Main content area */}
      <div className="upload-box">
        <div className="upload-header">
          <h2>File Management DApp</h2>
          {activeView === "view" && (
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </div>
  
        {activeView === "upload" ? (
          <>
            <input type="file" onChange={handleFileChange} className="file-input" />
            <button onClick={uploadToIPFS} className="upload-button">Upload</button>
          </>
        ) : (
          <>
            <h2 className="uploaded-title">Uploaded Files</h2>
            <table className="file-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>CID</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => (
                  <tr key={index}>
                    <td>{file.name}</td>
                    <td>
                      <a href={`http://ipfs.io/ipfs/${file.cid}`} target="_blank" rel="noopener noreferrer">
                        {file.cid}
                      </a>
                    </td>
                    <td>{new Date(file.timestamp * 1000).toLocaleString()}</td>
                    <td>
                      <button onClick={() => deleteFile(index)} className="delete-button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
  
  
};

export default FileUpload;
