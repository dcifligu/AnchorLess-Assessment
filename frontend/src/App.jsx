import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import NotFound from './components/NotFound';
import { UploadIcon, FolderIcon } from './components/common/Icons';
import "./index.css";

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Routes>
        {/* Main Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<FileUploadPage />} />
          <Route path="files" element={<FileListPage />} />
        </Route>
        
        {/* 404 Route - This should be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function MainLayout() {
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="text-center mb-8 animate-fadeIn">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          VISA Dossier
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Professional Document Management System
        </p>
        
        {/* Navigation */}
        {(location.pathname === '/' || location.pathname === '/files') && (
          <nav className="flex justify-center space-x-2 bg-white rounded-xl p-2 shadow-lg inline-flex border">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                location.pathname === '/'
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <UploadIcon className="w-5 h-5" />
              <span>Upload Files</span>
            </Link>
            <Link
              to="/files"
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                location.pathname === '/files'
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FolderIcon className="w-5 h-5" />
              <span>View Files</span>
            </Link>
          </nav>
        )}
      </header>

      <main className="animate-slideIn">
        <Routes>
          <Route path="/" element={<FileUploadPage />} />
          <Route path="/files" element={<FileListPage />} />
        </Routes>
      </main>
    </div>
  );
}

function FileUploadPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <FileUpload />
      <div className="mt-8 text-center">
        <Link
          to="/files"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
        >
          <FolderIcon className="w-5 h-5" />
          <span>View uploaded files</span>
        </Link>
      </div>
    </div>
  );
}

function FileListPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <FileList />
      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
        >
          <UploadIcon className="w-5 h-5" />
          <span>Upload more files</span>
        </Link>
      </div>
    </div>
  );
}

export default App;