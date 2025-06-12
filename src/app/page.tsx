'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TIMESLINES } from '../timelines';

const sendTimeline = async (timeline: unknown) => {
  const response = await axios.post('http://localhost:3001/timeline', timeline, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

const checkHealth = async () => {
  const response = await axios.get('http://localhost:3001/health');
  return response.data;
};

export default function Home() {
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth
  });

  // TanStack Query mutation for POST request
  const mutation = useMutation({
    mutationFn: sendTimeline,
    onSuccess: (data) => {
      console.log('Success:', data);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });

  const handleClick = (timeline: unknown) => {
    mutation.mutate(timeline);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gray-50 py-8">
      <h1 className="text-4xl font-bold text-gray-900">Turntable Controller</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
        <button
          onClick={() => handleClick(TIMESLINES.FULL_CAPTURE)}
          className="py-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg shadow-lg transition-colors"
        >
          Full Capture
        </button>
        <button
          onClick={() => handleClick(TIMESLINES.PIVOT)}
          className="py-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg shadow-lg transition-colors"
        >
          Pivot
        </button>
        <button
          onClick={() => handleClick(TIMESLINES.NOTHING)}
          className="py-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg shadow-lg transition-colors"
        >
          Action Shot
        </button>
        <button
          onClick={() => handleClick(TIMESLINES.NOTHING)}
          className="py-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg shadow-lg transition-colors"
        >
          Front Arc
        </button>
      </div>

      {mutation.isPending && <p className="text-blue-600 font-medium">Sending...</p>}
      {mutation.isSuccess && <p className="text-green-600 font-medium">✓ Successfully sent!</p>}
      {mutation.isError && (
        <p className="text-red-600 font-medium">
          ✗ Error: {mutation.error instanceof Error ? mutation.error.message : 'Unknown error'}
        </p>
      )}

      {health && (
        <p className="text-sm text-gray-500">
          Health: {typeof health === 'object' ? JSON.stringify(health) : String(health)}
        </p>
      )}
    </div>
  );
}
