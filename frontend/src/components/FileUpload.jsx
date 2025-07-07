import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileOperations } from '../hooks/UseFileOperations.js';
import { LoadingSpinner } from './common/LoadingSpinner.jsx';
import { ErrorMessage } from './common/ErrorMessage.jsx';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');
  const { uploadFile, loading, error, clearError } = useFileOperations();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setSuccess('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const result = await uploadFile(file);
      setSuccess('File uploaded successfully!');
      setFile(null);
      e.target.reset();
      
      // Show success message for 2 seconds, then navigate to file list
      setTimeout(() => {
        navigate('/files');
      }, 2000);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload a File</h2>
      
      <ErrorMessage message={error} onDismiss={clearError} />
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
          <div className="text-sm mt-1">Redirecting to file list...</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg"
            onChange={handleChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: PDF, PNG, JPG (max 4MB)
          </p>
        </div>
        
        <button 
          type="submit" 
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <LoadingSpinner size="small" message="Uploading..." />
          ) : (
            'Upload File'
          )}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;