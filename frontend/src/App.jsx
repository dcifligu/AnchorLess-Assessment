import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import FileUpload from "./components/FileUpload.jsx";
import FileList from "./components/FileList.jsx";

function App() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h1>VISA Dossier - File Upload</h1>
      <nav>
        <Link to="/">Upload</Link> | <Link to="/files">Files</Link>
      </nav>
      <Routes>
        <Route path="/" element={<FileUpload />} />
        <Route path="/files" element={<FileList />} />
      </Routes>
    </div>
  );
}

export default App;