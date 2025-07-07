import React, { useState, useEffect, useCallback } from 'react';
import { useFileOperations } from '../hooks/UseFileOperations.js';
import { LoadingSpinner } from './common/LoadingSpinner.jsx';
import { ErrorMessage } from './common/ErrorMessage.jsx';
import { 
  DocumentIcon, 
  PlaneIcon, 
  CertificateIcon, 
  FolderIcon, 
  FileIcon, 
  ImageIcon, 
  TrashIcon
} from './common/Icons.jsx';

const API_URL = import.meta.env.VITE_API_URL;

function FileList() {
  const [files, setFiles] = useState({ financial: [], travel: [], education: [], other: [] });
  const [deleteStatus, setDeleteStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { fetchFiles, deleteFile, loading, error, clearError } = useFileOperations();

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      
      setTimeout(() => setDeleteStatus(''), 3000);
    } catch (err) {
      setDeleteStatus('');
      console.error('Delete failed:', err);
    }
  };


  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = getFileUrl(file);
    link.download = file.original_name;
    link.click();
  };

  const getFileUrl = (file) => `${API_URL.replace('/api', '')}/storage/${file.path}`;

  const getUploadTypeLabel = (type) => {
    const labels = {
      financial: 'Financial Documents',
      travel: 'Travel Documents', 
      education: 'Education Documents',
      other: 'Other Files'
    };
    return labels[type] || 'Unknown Type';
  };

  const getUploadTypeIcon = (type) => {
    const icons = {
      financial: DocumentIcon,
      travel: PlaneIcon,
      education: CertificateIcon,
      other: FolderIcon
    };
    return icons[type] || FolderIcon;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FileItem = ({ file, index }) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
      <li 
        className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] animate-slideIn`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="relative group">
            {isImage ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={getFileUrl(file)}
                  alt={file.original_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gray-100 items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-blue-200">
                {isPDF ? (
                  <div className="text-center">
                    <FileIcon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-blue-600">PDF</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileIcon className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-gray-600">FILE</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{file.original_name}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatFileSize(file.size)}</span>
              
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          
          <button
            onClick={() => handleDelete(file.id, file.original_name)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            disabled={loading}
            title="Delete"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </li>
    );
  };

  const FileGroup = ({ title, files, emptyMessage, icon: IconComponent }) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <IconComponent className="w-5 h-5 mr-3 text-blue-600" />
        {title} ({files.length})
      </h3>
      {files.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <IconComponent className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 italic">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {files.map((file, index) => (
            <FileItem key={file.id} file={file} index={index} />
          ))}
        </ul>
      )}
    </div>
  );

  if (loading && Object.values(files).every(group => group.length === 0)) {
    return <LoadingSpinner message="Loading files..." />;
  }

  return (
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Uploaded Files</h2>
            <p className="text-gray-600 mt-1">Manage and preview your uploaded documents</p>
          </div>
          <button
            onClick={loadFiles}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        
        <ErrorMessage message={error} onDismiss={clearError} />
        
        {deleteStatus && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 animate-slideIn">
            {deleteStatus}
          </div>
        )}

        <FileGroup 
          title={getUploadTypeLabel('financial')}
          files={files.financial || []} 
          emptyMessage="No financial documents uploaded yet"
          icon={getUploadTypeIcon('financial')}
        />
        
        <FileGroup 
          title={getUploadTypeLabel('travel')}
          files={files.travel || []} 
          emptyMessage="No travel documents uploaded yet"
          icon={getUploadTypeIcon('travel')}
        />

        <FileGroup 
          title={getUploadTypeLabel('education')}
          files={files.education || []} 
          emptyMessage="No education documents uploaded yet"
          icon={getUploadTypeIcon('education')}
        />
        
        <FileGroup 
          title={getUploadTypeLabel('other')}
          files={files.other || []} 
          emptyMessage="No other files uploaded yet"
          icon={getUploadTypeIcon('other')}
        />
      </div>

    </div>
  );
}

export default FileList;