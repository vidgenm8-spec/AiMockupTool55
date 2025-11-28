
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import SparklesIcon from './icons/SparklesIcon';

interface ImageCardProps {
  image: GeneratedImage;
  onEdit: (id: string, prompt: string) => void;
  isGenerating: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onEdit, isGenerating }) => {
  const [editPrompt, setEditPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPrompt.trim() && !isGenerating) {
      onEdit(image.id, editPrompt);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 flex flex-col animate-fade-in">
        <div className="relative group">
            <img src={image.src} alt="Generated mockup" className="w-full h-auto object-cover aspect-[3/4]" />
            <a
                href={image.src}
                download={`mockup-${image.id}.jpg`}
                className="absolute top-3 right-3 bg-gray-900 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 hover:scale-110 transition-transform duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Download image"
            >
                <DownloadIcon className="w-5 h-5" />
            </a>
        </div>
        <div className="p-4 flex-grow flex flex-col">
            <form onSubmit={handleSubmit} className="mt-auto">
                <label htmlFor={`edit-prompt-${image.id}`} className="sr-only">Edit prompt</label>
                <div className="flex gap-2">
                    <input
                        id={`edit-prompt-${image.id}`}
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g., 'Add a retro filter'"
                        disabled={isGenerating}
                        className="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!editPrompt.trim() || isGenerating}
                        className="flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-4 h-4 mr-1.5" />
                        <span>Edit</span>
                    </button>
                </div>
            </form>
        </div>
         <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default ImageCard;
