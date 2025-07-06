import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function FileUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/files`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        setStatus(`Error: ${err.message || "Upload failed"}`);
      } else {
        setStatus("Upload successful!");
      }
    } catch (err) {
      setStatus("Network error");
    }
  };

  return (
    <div>
      <h2>Upload a File</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf,image/png,image/jpeg"
          onChange={handleChange}
        />
        <button type="submit" disabled={!file}>
          Upload
        </button>
      </form>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
}

export default FileUpload;