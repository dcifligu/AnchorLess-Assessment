import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export const useFileOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadFile = useCallback(async (file, uploadType, sessionId, fileTypeIndex, fileIndex) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', uploadType);
      formData.append('upload_session_id', sessionId);
      formData.append('file_type_index', fileTypeIndex);
      formData.append('file_index', fileIndex);

      const response = await fetch(`${API_URL}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Upload failed for ${file.name}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // Server returned non-JSON (likely HTML error page)
          if (response.status === 413) {
            errorMessage = `File ${file.name} is too large. Maximum size is 4MB.`;
          } else {
            errorMessage = `Upload failed for ${file.name}: Server error (${response.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
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
      const data = await response.json();
      return data;
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
        throw new Error('Failed to delete file');
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploadFile,
    fetchFiles,
    deleteFile,
    loading,
    error,
    clearError,
  };
};