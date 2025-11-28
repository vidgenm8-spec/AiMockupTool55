
import React, { useState, useCallback, useRef } from 'react';
import UploadIcon from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragEvent = useCallback((e: React.DragEvent<HTMLLabelElement>, entering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
        setIsDragging(entering);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvent(e, false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleDragEvent, onFileSelect, disabled]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
        <label
            htmlFor="file-upload"
            onDragEnter={(e) => handleDragEvent(e, true)}
            onDragLeave={(e) => handleDragEvent(e, false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
            ${disabled ? 'cursor-not-allowed bg-gray-800' : 'bg-gray-800 hover:bg-gray-700'}
            ${isDragging ? 'border-sky-400 bg-gray-700' : 'border-gray-600'}`}
        >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <UploadIcon className={`w-10 h-10 mb-3 ${isDragging ? 'text-sky-400' : 'text-gray-400'}`} />
                <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold text-sky-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Upload a photo of your clothing item</p>
            </div>
            <input
                ref={inputRef}
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                disabled={disabled}
            />
        </label>
    </div>
  );
};

export default FileUpload;
