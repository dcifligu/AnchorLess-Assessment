import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function groupFiles(files) {
  const groups = { Images: [], PDFs: [], Others: [] };
  Object.values(files).flat().forEach((file) => {
    if (file.type.startsWith("image/")) {
      groups.Images.push(file);
    } else if (file.type === "application/pdf") {
      groups.PDFs.push(file);
    } else {
      groups.Others.push(file);
    }
  });
  return groups;
}

function FileList() {
  const [files, setFiles] = useState({ Images: [], PDFs: [], Others: [] });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/files`);
      const data = await res.json();
      setFiles(groupFiles(data));
    } catch {
      setStatus("Failed to load files");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    setStatus("Deleting...");
    try {
      const res = await fetch(`${API_URL}/files/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStatus("File deleted");
        fetchFiles();
      } else {
        setStatus("Failed to delete");
      }
    } catch {
      setStatus("Network error");
    }
  };

  // Helper to get public file URLs (you may need to adjust the backend to serve files if not public)
  const getFileUrl = (file) => `${API_URL.replace("/api", "")}/storage/${file.path}`;

  return (
    <div>
      <h2>Uploaded Files</h2>
      {status && <div style={{ margin: "8px 0" }}>{status}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        ["Images", "PDFs", "Others"].map((group) => (
          <div key={group}>
            <h3>{group}</h3>
            <ul>
              {files[group].length === 0 && <li>(none)</li>}
              {files[group].map((file) => (
                <li key={file.id} style={{ marginBottom: 8 }}>
                  {file.type.startsWith("image/") ? (
                    <img
                      src={getFileUrl(file)}
                      alt={file.original_name}
                      style={{ width: 60, height: 60, objectFit: "cover", verticalAlign: "middle" }}
                    />
                  ) : (
                    <span>{file.original_name}</span>
                  )}{" "}
                  <button onClick={() => handleDelete(file.id)} style={{ marginLeft: 8 }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default FileList;