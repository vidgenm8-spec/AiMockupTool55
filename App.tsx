
import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import ImageCard from './components/ImageCard';
import { generateMockup, editImage } from './services/geminiService';
import { GeneratedImage, MockupStyle, MOCKUP_STYLES, ClothingType, CLOTHING_TYPES } from './types';
import SparklesIcon from './components/icons/SparklesIcon';

const App: React.FC = () => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
    const [mockupStyle, setMockupStyle] = useState<MockupStyle>('male-model');
    const [clothingType, setClothingType] = useState<ClothingType>('t-shirt');
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uploadedFile) {
            setUploadedFilePreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(uploadedFile);
        setUploadedFilePreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [uploadedFile]);

    const handleFileSelect = (file: File) => {
        setUploadedFile(file);
        setGeneratedImages([]);
        setError(null);
    };

    const handleGenerateMockups = async () => {
        if (!uploadedFile) return;

        setIsLoading(true);
        setError(null);
        
        const messages = ["Analyzing your clothing...", "Warming up the virtual studio...", "Generating photorealistic mockups...", "This can take a minute, great art needs patience."];
        let messageIndex = 0;
        setLoadingMessage(messages[messageIndex]);
        const interval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setLoadingMessage(messages[messageIndex]);
        }, 3000);

        try {
            const images = await generateMockup(uploadedFile, mockupStyle, clothingType, customPrompt);
            setGeneratedImages(images.map((src, index) => ({ id: `${Date.now()}-${index}`, src })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            clearInterval(interval);
        }
    };
    
    const handleEditImage = async (id: string, prompt: string) => {
        const imageToEdit = generatedImages.find(img => img.id === id);
        if (!imageToEdit) return;

        setIsLoading(true);
        setError(null);
        setLoadingMessage("Applying your creative edits...");

        try {
            const newImageSrc = await editImage(imageToEdit.src, prompt);
            setGeneratedImages(prevImages => prevImages.map(img => img.id === id ? { ...img, src: newImageSrc } : img));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            {isLoading && <Loader message={loadingMessage} />}
            <header className="w-full max-w-5xl mx-auto text-center mb-8">
                <div className="flex items-center justify-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-sky-400"/>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">AI Mockup Studio</h1>
                </div>
                <p className="mt-2 text-md text-gray-400">
                    Transform your clothing photos into stunning mockups instantly.
                </p>
            </header>
            
            <main className="w-full max-w-5xl mx-auto flex-grow">
                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {!uploadedFile && <FileUpload onFileSelect={handleFileSelect} disabled={isLoading} />}
                
                {uploadedFile && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 text-center">
                            <img src={uploadedFilePreview || ''} alt="Clothing preview" className="w-32 h-32 object-contain rounded-md bg-gray-700 p-1 mx-auto" />
                             <button onClick={() => setUploadedFile(null)} disabled={isLoading} className="mt-3 w-full bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 text-sm">
                                Change Photo
                            </button>
                        </div>
                        <div className="flex-grow w-full space-y-4">
                            <div>
                                <p className="text-lg font-semibold text-white mb-2">1. Select Clothing Type</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {CLOTHING_TYPES.map(({ id, name }) => (
                                        <button
                                            key={id}
                                            onClick={() => setClothingType(id)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${clothingType === id ? 'bg-sky-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-sky-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-white mb-2">2. Choose Mockup Style</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {MOCKUP_STYLES.map(({ id, name }) => (
                                        <button
                                            key={id}
                                            onClick={() => setMockupStyle(id)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${mockupStyle === id ? 'bg-sky-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-sky-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <p className="text-lg font-semibold text-white mb-2">3. Add Custom Details <span className="text-gray-400 text-sm">(Optional)</span></p>
                                <input
                                    type="text"
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="e.g., 'model walking in a park', 'on a marble table'"
                                    className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                                    disabled={isLoading}
                                />
                            </div>
                             <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button onClick={handleGenerateMockups} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                    <SparklesIcon className="w-5 h-5" />
                                    Generate Mockups
                                </button>
                             </div>
                        </div>
                    </div>
                )}
                
                {generatedImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {generatedImages.map((image) => (
                            <ImageCard key={image.id} image={image} onEdit={handleEditImage} isGenerating={isLoading} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
