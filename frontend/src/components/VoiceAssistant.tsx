import React, { useState, useRef } from 'react';
import { Mic, Upload, Play, Pause, Volume2 } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const VoiceAssistant: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const API_BASE_URL = 'http://localhost:8000';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setAudioFile(selectedFile);
      setError(null);
      // Reset previous results
      setSummary(null);
      setAudioUrl(null);
    } else {
      setError('Please select a valid audio file');
    }
  };
const handleUpload = async () => {
  if (!audioFile) return;

  setIsUploading(true);
  setError(null);

  try {
    const result = await apiClient.uploadAudio(audioFile);
    console.log("API response:", result); // Debug log to check API response

    if (result.success && result.data) {
      setSummary(result.data.summary || 'No summary available');
      if (result.data.audio_path) {
        setAudioUrl(`${API_BASE_URL}${result.data.audio_path}`);
      }
      setError(null); // Clear error on success
    } else {
      setError(result.error || 'Upload failed');
      setSummary(null); // Clear previous summary on error
      setAudioUrl(null); // Clear previous audio URL on error
    }
  } catch (err) {
    setError('Network error occurred');
    setSummary(null);
    setAudioUrl(null);
  } finally {
    setIsUploading(false);
  }
};

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Mic className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Voice Assistant</h2>
        </div>
        <p className="text-gray-600">
          Upload an audio file to get transcription, summary, and AI-generated speech response.
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Upload Audio File</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
          >
            Click to select audio file
          </label>
          <p className="text-gray-500 text-sm mt-2">
            Supports MP3, WAV, M4A, and other audio formats
          </p>
        </div>

        {audioFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Selected:</strong> {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="small" className="inline mr-2" />
                  Processing...
                </>
              ) : (
                'Process Audio'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {summary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">AI Response</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">AI Response Audio</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayback}
              className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">
                {isPlaying ? 'Playing...' : 'Click to play AI response'}
              </span>
            </div>
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}
    </div>
  );
};