'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

// Type for the JSON data being sent
type JsonData = Record<string, unknown>;

// API function to send JSON to timeline endpoint
const sendJsonToTimeline = async (jsonData: JsonData) => {
  const response = await axios.post('http://localhost:3001/timeline', jsonData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export default function Home() {
  const [jsonInput, setJsonInput] = useState('{\n  "message": "Hello World",\n  "timestamp": "2024-01-01T00:00:00Z"\n}');
  const [isValidJson, setIsValidJson] = useState(true);
  const [parsedJson, setParsedJson] = useState<JsonData | null>(null);

  // TanStack Query mutation for POST request
  const mutation = useMutation({
    mutationFn: sendJsonToTimeline,
    onSuccess: (data) => {
      console.log('Success:', data);
    },
    onError: (error) => {
      console.error('Error:', error);
    },
  });

  // Validate JSON input
  const validateJson = (input: string) => {
    try {
      const parsed = JSON.parse(input) as JsonData;
      setParsedJson(parsed);
      setIsValidJson(true);
      return true;
    } catch {
      setIsValidJson(false);
      setParsedJson(null);
      return false;
    }
  };

  // Handle JSON input change
  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setJsonInput(newValue);
    validateJson(newValue);
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!isValidJson || !parsedJson) {
      alert('Please enter valid JSON before submitting');
      return;
    }

    mutation.mutate(parsedJson);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">JSON Timeline Editor</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* JSON Editor */}
            <div>
              <label htmlFor="json-editor" className="block text-sm font-medium text-gray-700 mb-2">
                JSON Data
              </label>
              <textarea
                id="json-editor"
                value={jsonInput}
                onChange={handleJsonChange}
                className={`w-full h-64 p-4 border rounded-lg font-mono text-gray-900 text-sm resize-y ${
                  isValidJson 
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                }`}
                placeholder="Enter your JSON data here..."
              />
              {!isValidJson && (
                <p className="mt-2 text-sm text-red-600">
                  Invalid JSON format. Please check your syntax.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <button
                type="submit"
                disabled={!isValidJson || mutation.isPending}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  !isValidJson || mutation.isPending
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                }`}
              >
                {mutation.isPending ? 'Sending...' : 'Send to Timeline'}
              </button>

              {/* Status Messages */}
              <div className="flex items-center space-x-4">
                {mutation.isPending && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Sending...
                  </div>
                )}
                
                {mutation.isSuccess && (
                  <div className="text-green-600 font-medium">
                    ✓ Successfully sent to timeline!
                  </div>
                )}
                
                {mutation.isError && (
                  <div className="text-red-600 font-medium">
                    ✗ Error: {mutation.error instanceof Error ? mutation.error.message : 'Unknown error'}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Response Data */}
          {mutation.isSuccess && mutation.data && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-2">Response Data:</h3>
              <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(mutation.data, null, 2)}
              </pre>
            </div>
          )}

          {/* Error Details */}
          {mutation.isError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Details:</h3>
              <div className="text-sm text-red-700">
                {axios.isAxiosError(mutation.error) ? (
                  <div>
                    <p><strong>Status:</strong> {mutation.error.response?.status}</p>
                    <p><strong>Message:</strong> {mutation.error.message}</p>
                    {mutation.error.response?.data && (
                      <div>
                        <strong>Response:</strong>
                        <pre className="mt-2 bg-red-100 p-3 rounded overflow-x-auto">
                          {JSON.stringify(mutation.error.response.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{mutation.error instanceof Error ? mutation.error.message : 'Unknown error occurred'}</p>
                )}
              </div>
            </div>
          )}

          {/* JSON Preview */}
          {isValidJson && parsedJson && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">JSON Preview:</h3>
              <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
                {JSON.stringify(parsedJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
