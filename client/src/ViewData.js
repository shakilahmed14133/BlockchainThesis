import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewData = ({ uploadedFiles }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Uploaded Files</h2>
            <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => navigate("/")}>Upload New File</button>

            <table border="1" style={{ width: "100%", marginTop: "10px" }}>
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>CID</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {uploadedFiles
                        .filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((file, index) => (
                            <tr key={index}>
                                <td>{file.name}</td>
                                <td>
                                    <a href={`http://ipfs.io/ipfs/${file.cid}`} target="_blank" rel="noopener noreferrer">
                                        {file.cid}
                                    </a>
                                </td>
                                <td>{new Date(file.timestamp * 1000).toLocaleString()}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewData;
