import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useFileOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = useCallback(async (file, uploadType, sessionId, stepIndex, fileIndex) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', uploadType);
      formData.append('upload_session_id', sessionId);
      formData.append('step_index', stepIndex.toString());
      formData.append('file_index', fileIndex.toString());
      
      const response = await fetch(`${API_URL}/files/single`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUploadRequirements = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/files/requirements`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch upload requirements');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/files`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/files/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadFile,
    getUploadRequirements,
    fetchFiles,
    deleteFile,
    loading,
    error,
    clearError
  };
}