import React, { useState, useEffect } from "react";
import { create } from "ipfs-http-client";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import FileStorageABI from "./contracts/FileStorage.json";

const ipfs = create({ url: "http://localhost:5001/api/v0" });

const FileUpload = ({ setUploadedFiles }) => {
    const [file, setFile] = useState(null);
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadBlockchainData();
    }, []);

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
            } else {
                alert("Smart contract not found on this network.");
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const uploadToIPFS = async () => {
        if (!file) return alert("Please select a file");
        if (!contract) return alert("Smart contract not loaded.");

        try {
            const added = await ipfs.add(file);
            const cid = added.path;
            const fileName = file.name;
            const timestamp = Math.floor(Date.now() / 1000);

            await contract.methods.uploadFile(cid, fileName).send({ from: account });

            setUploadedFiles(prevFiles => [...prevFiles, { cid, name: fileName, timestamp }]);
            alert("File uploaded successfully!");
            navigate("/view-data");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>File Upload</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={uploadToIPFS} style={{ marginLeft: "10px" }}>Upload</button>
            <br /><br />
            <button onClick={() => navigate("/view-data")} style={{ marginTop: "10px" }}>View Uploaded Files</button>
        </div>
    );
};

export default FileUpload;
