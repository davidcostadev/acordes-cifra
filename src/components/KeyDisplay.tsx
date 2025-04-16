import React from 'react';
import { useSongProcessing } from '../hooks/useSongProcessing';

interface KeyDisplayProps {
  fileName: string;
  transpose: number;
}

export const KeyDisplay: React.FC<KeyDisplayProps> = ({ fileName, transpose }) => {
  const { transposedKey, isLoading, error } = useSongProcessing(fileName, transpose);

  if (isLoading) {
    return <div className="w-12 text-center font-mono">...</div>;
  }

  if (error) {
    return <div className="w-12 text-center font-mono text-red-500">Error</div>;
  }

  return (
    <div className="w-8 text-center font-mono font-bold" data-testid="key-display">
      {transposedKey}
    </div>
  );
};
