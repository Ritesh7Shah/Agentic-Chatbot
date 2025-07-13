import React, { useState } from 'react';
import { BarChart3, Upload, Search } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const CSVQuery: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
      setUploadSuccess(false);
      setResponse(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await apiClient.uploadCSV(file);
      if (result.success) {
        setUploadSuccess(true);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsQuerying(true);
    setError(null);

    try {
      const result = await apiClient.queryCSV(query);
      if (result.success && result.data) {
        setResponse(result.data.answer);
      } else {
        setError(result.error || 'Query failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsQuerying(false);
    }
  };

  const exampleQueries = [
    "What are the column names in this dataset?",
    "How many rows are in the data?",
    "What is the average value in the numeric columns?",
    "Show me the top 5 records by value",
    "What are the unique values in the category column?"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">CSV Data Analyzer</h2>
        </div>
        <p className="text-gray-600">
          Upload a CSV file and ask questions about your data. Get insights, statistics, and analysis.
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">1. Upload CSV File</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
          >
            Click to select CSV file
          </label>
          <p className="text-gray-500 text-sm mt-2">or drag and drop</p>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
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
                'Upload CSV'
              )}
            </button>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              ✅ CSV uploaded successfully! You can now analyze your data.
            </p>
          </div>
        )}
      </div>

      {/* Query Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">2. Analyze Your Data</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to know about your data?
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your CSV data..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={!uploadSuccess}
            />
          </div>

          {/* Example Queries */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Example queries:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  disabled={!uploadSuccess}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleQuery}
            disabled={!query.trim() || !uploadSuccess || isQuerying}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isQuerying ? (
              <>
                <LoadingSpinner size="small" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response */}
      {response && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Analysis Result</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
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