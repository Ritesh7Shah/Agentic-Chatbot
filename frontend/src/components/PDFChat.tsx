import React, { useState } from 'react';
import { FileText, Upload, MessageSquare } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const PDFChat: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setUploadSuccess(false);
      setUploadMessage(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await apiClient.uploadPDF(file);
      if (result.success) {
        setUploadSuccess(true);
        setUploadMessage(result.data?.message || 'PDF uploaded successfully!');
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">PDF Chat with RAG</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Upload a PDF document and then use Smart Chat to ask questions about its content.
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Upload PDF Document</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
          >
            Click to select PDF file
          </label>
          <p className="text-gray-500 text-sm mt-2">or drag and drop</p>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Selected:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="small" className="inline mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload PDF'
              )}
            </button>
          </div>
        )}

        {uploadSuccess && uploadMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              ✅ {uploadMessage}
            </p>
          </div>
        )}
      </div>

      {/* Instructions for Querying */}
      {uploadSuccess && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-blue-800 mb-2">Next Step: Ask Questions</h3>
              <p className="text-blue-700 mb-3">
                Your PDF has been uploaded successfully! Now you can ask questions about the document content.
              </p>
              <p className="text-blue-600 text-sm">
                <strong>How to use:</strong> Go to the <strong>Smart Chat</strong> tab and ask questions like:
              </p>
              <ul className="text-blue-600 text-sm mt-2 ml-4 space-y-1">
                <li>• "What is the main topic of the PDF document?"</li>
                <li>• "Can you summarize the key points from the document?"</li>
                <li>• "What does the document say about [specific topic]?"</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}
    </div>
  );
};