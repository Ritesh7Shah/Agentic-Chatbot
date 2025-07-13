import React, { useState } from 'react';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const CalendarEvent: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [eventLink, setEventLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const API_BASE_URL = 'http://localhost:8000';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.start_time || !formData.end_time) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate that end time is after start time
    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      setError('End time must be after start time');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await apiClient.createCalendarEvent({
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time,
        end_time: formData.end_time,
      });
      if (result.success && result.data) {
        setResponse('Event created successfully!');
        setEventLink(result.data.event_link || null);
        // Reset form
        setFormData({
          title: '',
          description: '',
          start_time: '',
          end_time: '',
        });
      } else {
        setError(result.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  // Get current date and time in local timezone for min values
  const now = new Date();
  const currentDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Calendar Event Creator</h2>
        </div>
        <p className="text-gray-600">
          Create a new calendar event with all the details. The event will be added to your calendar.
        </p>
      </div>

      {/* Event Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-6">Event Details</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                min={currentDateTime}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                min={formData.start_time || currentDateTime}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isCreating ? (
              <>
                <LoadingSpinner size="small" />
                <span>Creating Event...</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                <span>Create Event</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Response */}
      {response && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Event Created Successfully</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">{response}</p>
          </div>
          
          {eventLink && (
            <div className="mt-4">
              <a
                href={eventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Event in Calendar</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}
    </div>
  );
};