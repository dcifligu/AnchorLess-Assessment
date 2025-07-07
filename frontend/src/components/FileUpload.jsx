import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileOperations } from '../hooks/UseFileOperations.js';
import { LoadingSpinner } from './common/LoadingSpinner.jsx';
import { ErrorMessage } from './common/ErrorMessage.jsx';

function FileUpload() {
  const [uploadType, setUploadType] = useState('');
  const [pdfFiles, setPdfFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [requirements, setRequirements] = useState({});
  const [sessionId, setSessionId] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ pdfs: {}, images: {} });
  
  const { uploadFile, getUploadRequirements, loading, error, clearError } = useFileOperations();
  const navigate = useNavigate();

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      const reqs = await getUploadRequirements();
      setRequirements(reqs);
    } catch (err) {
      console.error('Failed to load requirements:', err);
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setUploadType(newType);
    setPdfFiles([]);
    setImageFiles([]);
    setSuccess('');
    clearError();
    setUploadProgress({ pdfs: {}, images: {} });
    
    if (newType) {
      setSessionId(Date.now().toString() + Math.random().toString(36).substr(2, 9));
    }
  };

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files);
    setPdfFiles(files);
    clearError();
    
    // Initialize progress tracking for PDFs
    const progress = {};
    files.forEach((file, index) => {
      progress[index] = { name: file.name, status: 'ready' };
    });
    setUploadProgress(prev => ({ ...prev, pdfs: progress }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    clearError();
    
    // Initialize progress tracking for images
    const progress = {};
    files.forEach((file, index) => {
      progress[index] = { name: file.name, status: 'ready' };
    });
    setUploadProgress(prev => ({ ...prev, images: progress }));
  };

  const getCurrentRequirements = () => {
    if (!uploadType || !requirements[uploadType]) return null;
    
    const reqs = requirements[uploadType].requirements;
    let pdfRequirement = null;
    let imageRequirement = null;
    
    reqs.forEach(req => {
      if (req.type === 'pdf') pdfRequirement = req;
      else if (req.type === 'image' || req.type === 'png') {
        imageRequirement = req;
      }
    });
    
    return { pdfRequirement, imageRequirement };
  };

  const validateFiles = () => {
    const currentReqs = getCurrentRequirements();
    if (!currentReqs) return false;
    
    const { pdfRequirement, imageRequirement } = currentReqs;
    
    // Check PDF requirements
    if (pdfRequirement && pdfFiles.length !== pdfRequirement.count) return false;
    
    // Check image requirements
    if (imageRequirement && imageFiles.length !== imageRequirement.count) return false;
    
    // Validate file types
    const validPdfs = pdfFiles.every(file => file.type === 'application/pdf');
    const validImages = imageFiles.every(file => {
      if (imageRequirement?.type === 'png') return file.type === 'image/png';
      return file.type.startsWith('image/');
    });
    
    return validPdfs && validImages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFiles()) return;

    try {
      const allFiles = [];
      
      // Upload PDFs first
      for (let i = 0; i < pdfFiles.length; i++) {
        setUploadProgress(prev => ({
          ...prev,
          pdfs: { ...prev.pdfs, [i]: { ...prev.pdfs[i], status: 'uploading' } }
        }));
        
        const result = await uploadFile(pdfFiles[i], uploadType, sessionId, 0, i);
        allFiles.push(result);
        
        setUploadProgress(prev => ({
          ...prev,
          pdfs: { ...prev.pdfs, [i]: { ...prev.pdfs[i], status: 'uploaded' } }
        }));
      }
      
      // Upload images
      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(prev => ({
          ...prev,
          images: { ...prev.images, [i]: { ...prev.images[i], status: 'uploading' } }
        }));
        
        const result = await uploadFile(imageFiles[i], uploadType, sessionId, 1, i);
        allFiles.push(result);
        
        setUploadProgress(prev => ({
          ...prev,
          images: { ...prev.images, [i]: { ...prev.images[i], status: 'uploaded' } }
        }));
      }
      
      setSuccess(`Successfully uploaded ${allFiles.length} files!`);
      setPdfFiles([]);
      setImageFiles([]);
      setUploadType('');
      e.target.reset();
      
      setTimeout(() => {
        navigate('/files');
      }, 5000);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const resetUpload = () => {
    setUploadType('');
    setPdfFiles([]);
    setImageFiles([]);
    setSuccess('');
    setSessionId('');
    setUploadProgress({ pdfs: {}, images: {} });
    clearError();
  };

  if (!uploadType) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        
        <ErrorMessage message={error} onDismiss={clearError} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Upload Type
          </label>
          <select
            value={uploadType}
            onChange={handleTypeChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose what you're uploading...</option>
            {Object.entries(requirements).map(([key, req]) => (
              <option key={key} value={key}>
                {req.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preview of requirements for each type */}
        <div className="mt-6 space-y-4">
          {Object.entries(requirements).map(([key, req]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 flex items-center mb-2">
                <span className="mr-2 text-lg">
                  {key === 'financial' ? '💰' : key === 'travel' ? '✈️' : '🎓'}
                </span>
                {req.label}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{req.description}</p>
              <div className="text-sm">
                <strong>Required files:</strong>
                <ul className="mt-1 space-y-1">
                  {req.requirements.map((reqItem, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      {reqItem.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentReqs = getCurrentRequirements();
  const { pdfRequirement, imageRequirement } = currentReqs || {};

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Upload {requirements[uploadType].label}
        </h2>
        <button
          onClick={resetUpload}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Change Type
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
          <div className="text-sm mt-1">Redirecting to file list...</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dual Upload Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PDF Upload Panel */}
          {pdfRequirement && (
            <UploadPanel
              title="PDF Documents"
              icon="📄"
              requirement={pdfRequirement}
              files={pdfFiles}
              onFileChange={handlePdfChange}
              acceptedTypes=".pdf"
              uploadProgress={uploadProgress.pdfs}
              loading={loading}
              color="blue"
            />
          )}

          {/* Image Upload Panel */}
          {imageRequirement && (
            <UploadPanel
              title={imageRequirement.type === 'png' ? 'PNG Images' : 'Images (PNG/JPG)'}
              icon="🖼️"
              requirement={imageRequirement}
              files={imageFiles}
              onFileChange={handleImageChange}
              acceptedTypes={imageRequirement.type === 'png' ? 'image/png' : 'image/png,image/jpeg'}
              uploadProgress={uploadProgress.images}
              loading={loading}
              color="green"
            />
          )}
        </div>

        {/* Validation Status */}
        {(pdfFiles.length > 0 || imageFiles.length > 0) && (
          <div className={`p-4 rounded-lg border ${
            validateFiles() 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {validateFiles() ? '✅ Ready to upload' : '❌ Please complete all requirements'}
              </span>
              <span className="text-sm">
                Total files: {pdfFiles.length + imageFiles.length}
              </span>
            </div>
            
            {/* Detailed validation status */}
            <div className="mt-2 space-y-1 text-sm">
              {pdfRequirement && (
                <div className={pdfFiles.length === pdfRequirement.count ? 'text-green-600' : 'text-red-600'}>
                  PDFs: {pdfFiles.length}/{pdfRequirement.count} required
                </div>
              )}
              {imageRequirement && (
                <div className={imageFiles.length === imageRequirement.count ? 'text-green-600' : 'text-red-600'}>
                  Images: {imageFiles.length}/{imageRequirement.count} required
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={!validateFiles() || loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium"
        >
          {loading ? (
            <LoadingSpinner size="small" message="Uploading files..." />
          ) : (
            `Upload All Files (${pdfFiles.length + imageFiles.length})`
          )}
        </button>
      </form>
    </div>
  );
}

// Reusable Upload Panel Component
function UploadPanel({ 
  title, 
  icon, 
  requirement, 
  files, 
  onFileChange, 
  acceptedTypes, 
  uploadProgress, 
  loading, 
  color 
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      accent: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200', 
      text: 'text-green-900',
      accent: 'text-green-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const getFileStatus = (index) => {
    return uploadProgress[index]?.status || 'ready';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploading': return 'text-yellow-600 bg-yellow-100';
      case 'uploaded': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'uploaded': return 'Uploaded ✓';
      case 'error': return 'Error ✗';
      default: return 'Ready';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${colors.border} ${colors.bg}`}>
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">{icon}</span>
        <h3 className={`text-lg font-semibold ${colors.text}`}>{title}</h3>
      </div>

      <div className={`mb-4 p-3 bg-white rounded border ${colors.border}`}>
        <div className={`text-sm ${colors.accent} font-medium mb-1`}>
          Required: {requirement.count} file{requirement.count > 1 ? 's' : ''}
        </div>
        <div className="text-xs text-gray-600">
          Max 4MB per file
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="file"
          multiple={requirement.count > 1}
          accept={acceptedTypes}
          onChange={onFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-50 border border-gray-300 rounded-md"
          disabled={loading}
        />

        {/* File Preview */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className={`text-sm font-medium ${colors.text}`}>
              Selected ({files.length}/{requirement.count}):
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-base">{icon}</span>
                    <span className="truncate font-medium text-gray-700">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      ({Math.round(file.size / 1024)} KB)
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${getStatusColor(getFileStatus(index))}`}>
                    {getStatusText(getFileStatus(index))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status indicator */}
        <div className={`text-center text-sm font-medium ${
          files.length === requirement.count 
            ? 'text-green-600' 
            : files.length > requirement.count 
            ? 'text-red-600' 
            : colors.accent
        }`}>
          {files.length === requirement.count 
            ? '✅ Requirement met' 
            : files.length > requirement.count 
            ? `❌ Too many files (${files.length}/${requirement.count})`
            : `${files.length}/${requirement.count} files selected`
          }
        </div>
      </div>
    </div>
  );
}

export default FileUpload;