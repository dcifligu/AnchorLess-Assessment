import React, { useEffect, useState, useCallback } from 'react';
import { useFileOperations } from '../hooks/UseFileOperations.js';
import { LoadingSpinner } from './common/LoadingSpinner.jsx';
import { ErrorMessage } from './common/ErrorMessage.jsx';

const API_URL = import.meta.env.VITE_API_URL;

function FileList() {
  const [files, setFiles] = useState({ images: [], pdfs: [], others: [] });
  const [deleteStatus, setDeleteStatus] = useState('');
  const { fetchFiles, deleteFile, loading, error, clearError } = useFileOperations();

  const loadFiles = useCallback(async () => {
    try {
      const data = await fetchFiles();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  }, [fetchFiles]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    setDeleteStatus('Deleting...');
    try {
      await deleteFile(id);
      setDeleteStatus('File deleted successfully');
      await loadFiles();
      
      // Clear success message after 3 seconds
      setTimeout(() => setDeleteStatus(''), 3000);
    } catch (err) {
      setDeleteStatus('');
      console.error('Delete failed:', err);
    }
  };

  const getFileUrl = (file) => `${API_URL.replace('/api', '')}/storage/${file.path}`;

  const FileItem = ({ file }) => (
    <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        {file.type.startsWith('image/') ? (
          <img
            src={getFileUrl(file)}
            alt={file.original_name}
            className="w-12 h-12 object-cover rounded border"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-xs">
              {file.type === 'application/pdf' ? 'PDF' : 'FILE'}
            </span>
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{file.original_name}</p>
          <p className="text-sm text-gray-500">
            {file.formatted_size || `${Math.round(file.size / 1024)} KB`}
          </p>
        </div>
      </div>
      <button
        onClick={() => handleDelete(file.id, file.original_name)}
        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded border border-red-300 hover:bg-red-50"
        disabled={loading}
      >
        Delete
      </button>
    </li>
  );

  const FileGroup = ({ title, files, emptyMessage }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
        {title} ({files.length})
      </h3>
      {files.length === 0 ? (
        <p className="text-gray-500 italic">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <FileItem key={file.id} file={file} />
          ))}
        </ul>
      )}
    </div>
  );

  if (loading && Object.values(files).every(group => group.length === 0)) {
    return <LoadingSpinner message="Loading files..." />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Uploaded Files</h2>
        <button
          onClick={loadFiles}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <ErrorMessage message={error} onDismiss={clearError} />
      
      {deleteStatus && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          {deleteStatus}
        </div>
      )}

      <FileGroup 
        title="Images" 
        files={files.images || []} 
        emptyMessage="No images uploaded yet"
      />
      
      <FileGroup 
        title="PDFs" 
        files={files.pdfs || []} 
        emptyMessage="No PDF files uploaded yet"
      />
      
      <FileGroup 
        title="Other Files" 
        files={files.others || []} 
        emptyMessage="No other files uploaded yet"
      />
    </div>
  );
}

export default FileList;