import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import "./index.css";

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VISA Dossier - File Upload
          </h1>
          <p className="text-gray-600 mb-6">
            Upload and manage your PDF, PNG, and JPG files
          </p>
          
          {/* Navigation */}
          <nav className="flex justify-center space-x-1 bg-white rounded-lg p-1 shadow-sm inline-flex">
            <Link
              to="/"
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Upload Files
            </Link>
            <Link
              to="/files"
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                location.pathname === '/files'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              View Files
            </Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<FileUploadPage />} />
            <Route path="/files" element={<FileListPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function FileUploadPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <FileUpload />
      <div className="mt-6 text-center">
        <Link
          to="/files"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          View uploaded files →
        </Link>
      </div>
    </div>
  );
}

function FileListPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <FileList />
      <div className="mt-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Upload more files
        </Link>
      </div>
    </div>
  );
}

export default App;