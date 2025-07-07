import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileOperations } from '../hooks/UseFileOperations.js';
import { LoadingSpinner } from './common/LoadingSpinner.jsx';
import { ErrorMessage } from './common/ErrorMessage.jsx';
import { UploadIcon, CheckIcon, DocumentIcon, PlaneIcon, CertificateIcon, FolderIcon } from './common/Icons.jsx';

const requirements = {
  financial: {
    label: 'Financial Documents',
    icon: DocumentIcon,
    requirements: [
      { type: 'pdf', count: 1, label: 'Bank Statement (PDF)' },
      { type: 'image', count: 1, label: 'ID Card Photo' }
    ]
  },
  travel: {
    label: 'Travel Documents',
    icon: PlaneIcon,
    requirements: [
      { type: 'pdf', count: 1, label: 'Flight Itinerary (PDF)' },
      { type: 'png', count: 1, label: 'Passport Photo (PNG)' }
    ]
  },
  education: {
    label: 'Education Documents',
    icon: CertificateIcon,
    requirements: [
      { type: 'pdf', count: 2, label: 'Transcripts & Diploma (2 PDFs)' },
      { type: 'image', count: 1, label: 'Student ID Photo' }
    ]
  },
  other: {
    label: 'Other Files',
    icon: FolderIcon,
    requirements: [
      { type: 'pdf', count: 1, label: 'Any PDF Document' },
      { type: 'image', count: 1, label: 'Any Image File' }
    ]
  }
};

function FileUpload() {
  const [uploadType, setUploadType] = useState('');
  const [pdfFiles, setPdfFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [sessionId] = useState(() => `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [uploadProgress, setUploadProgress] = useState({ pdfs: {}, images: {} });
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const { uploadFile, loading, error, clearError } = useFileOperations();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && success) {
      navigate('/files');
    }
    return () => clearInterval(interval);
  }, [countdown, success, navigate]);

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files);
    setPdfFiles(files);
    clearError();
    
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
    
    if (pdfRequirement && pdfFiles.length !== pdfRequirement.count) return false;
    if (imageRequirement && imageFiles.length !== imageRequirement.count) return false;
    
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
      setCountdown(10);
      setPdfFiles([]);
      setImageFiles([]);
      setUploadType('');
      e.target.reset();
      
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const resetUpload = () => {
    setUploadType('');
    setPdfFiles([]);
    setImageFiles([]);
    setUploadProgress({ pdfs: {}, images: {} });
    clearError();
    setSuccess('');
    setCountdown(0);
  };

  const handleContinueNow = () => {
    setCountdown(0);
  };

  const renderUploadTypeSelector = () => (
    <div className={`space-y-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Upload Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(requirements).map(([key, config]) => {
          const IconComponent = config.icon;
          return (
            <button
              key={key}
              onClick={() => setUploadType(key)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="flex items-center space-x-3">
                <IconComponent className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">{config.label}</h4>
                  <p className="text-sm text-gray-600">
                    {config.requirements.map(req => req.label).join(' + ')}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderFileRequirements = () => {
    const currentReqs = getCurrentRequirements();
    if (!currentReqs) return null;

    const { pdfRequirement, imageRequirement } = currentReqs;
    const config = requirements[uploadType];
    const IconComponent = config.icon;

    return (
      <div className="space-y-6 animate-slideIn">
        <div className="flex items-center space-x-3">
          <IconComponent className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">{config.label}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {pdfRequirement && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {pdfRequirement.label}
              </label>
              <input
                type="file"
                accept=".pdf"
                multiple={pdfRequirement.count > 1}
                onChange={handlePdfChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors"
              />
              {pdfFiles.length > 0 && (
                <div className="space-y-2">
                  {pdfFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="flex-1 flex items-center space-x-2">
                        <span className="text-gray-700">{file.name}</span>
                        {uploadProgress.pdfs[index]?.status === 'uploading' && (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {uploadProgress.pdfs[index]?.status === 'uploaded' && (
                          <CheckIcon className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {imageRequirement && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {imageRequirement.label}
              </label>
              <input
                type="file"
                accept={imageRequirement.type === 'png' ? '.png' : 'image/*'}
                multiple={imageRequirement.count > 1}
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors"
              />
              {imageFiles.length > 0 && (
                <div className="space-y-2">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="flex-1 flex items-center space-x-2">
                        <span className="text-gray-700">{file.name}</span>
                        {uploadProgress.images[index]?.status === 'uploading' && (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {uploadProgress.images[index]?.status === 'uploaded' && (
                          <CheckIcon className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!validateFiles() || loading}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload Files</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetUpload}
              className="px-4 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Files</h2>
        <p className="text-gray-600">Select your upload type and provide the required documents</p>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-slideIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckIcon className="w-5 h-5 text-green-600" />
              <span className="text-green-800">{success}</span>
            </div>
            <div className="flex items-center space-x-3">
              {countdown > 0 && (
                <span className="text-sm text-green-700">
                  Redirecting in {countdown}s...
                </span>
              )}
              <button
                onClick={handleContinueNow}
                className="text-sm text-green-700 hover:text-green-800 underline"
              >
                Continue now
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner message="Uploading files..." />}

      {!uploadType ? renderUploadTypeSelector() : renderFileRequirements()}
    </div>
  );
}

export default FileUpload;