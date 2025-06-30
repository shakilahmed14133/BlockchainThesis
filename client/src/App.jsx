import React, { useState, useEffect } from "react";
import { create } from "ipfs-http-client";
import Web3 from "web3";
import FileStorageABI from "./contracts/FileStorage.json";

const ipfs = create({ url: "http://localhost:5001/api/v0" });

const FileUpload = () => {
  const [file, setFile] = useState(null);
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
      // await fetchFiles(contract, account);
      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file from blockchain.");
    }
  };

  return (
    <div style={{
      textAlign: "center",
      padding: "20px",
      // backgroundImage: "url('https://www.bankrate.com/2021/12/12091324/Best-blockchain-ETFs.jpg?auto=webp&optimize=high&crop=16:9')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "100vh",
    }}>
      <div style={{
        maxWidth: "800px", margin: "auto", textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#007bff", color: "white", padding: "10px", borderRadius: "5px" }}>
          <h2 style={{ margin: 0 }}>File Management DApp</h2>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "5px", borderRadius: "5px", border: "none" }}
          />
        </div>

        <input
          type="file"
          onChange={handleFileChange}
          style={{
            display: "block",
            margin: "15px auto",
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            cursor: "pointer",
            width: "80%",
          }}
        />

        <button
          onClick={uploadToIPFS}
          style={{
            padding: "10px 15px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
            fontSize: "16px",
            transition: "0.3s ease-in-out",
            marginTop: "10px"
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#90EE90")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "green")}
        >
          Upload
        </button>

        <h2 style={{ marginTop: "20px", color: "white" }}>Uploaded Files</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", backgroundColor: "#ffffff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
          <thead>
            <tr style={{ backgroundColor: "#007bff", color: "white" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>File Name</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>CID</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Timestamp</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{file.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <a href={`http://ipfs.io/ipfs/${file.cid}`} target="_blank" rel="noopener noreferrer" style={{ color: "#000", textDecoration: "none" }}>{file.cid}</a>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{new Date(file.timestamp * 1000).toLocaleString()}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button onClick={() => deleteFile(index)} style={{ backgroundColor: "red", color: "white", border: "none", cursor: "pointer", padding: "5px 10px", borderRadius: "5px" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileUpload;
