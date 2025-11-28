import { MockupStyle, ClothingType } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const generateMockup = async (
  designImage: File,
  style: MockupStyle,
  clothingType: ClothingType,
  customPrompt: string,
): Promise<string[]> => {
  try {
    const base64Image = await fileToBase64(designImage);
    
    const response = await fetch('/api/generateMockup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            imageBase64: base64Image,
            mimeType: designImage.type,
            style,
            clothingType,
            customPrompt
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error occurred');
    }

    const data = await response.json();
    return data.images;

  } catch (error) {
    console.error("Error generating mockup:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate mockup. Please try again.");
  }
};

export const editImage = async (
  baseImage: string,
  editPrompt: string
): Promise<string> => {
    try {
        const response = await fetch('/api/editImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                baseImage,
                editPrompt
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error occurred');
        }

        const data = await response.json();
        return data.image;

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to edit the image. Please try a different prompt.");
    }
};
