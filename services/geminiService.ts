
import { GoogleGenAI, Modality } from "@google/genai";
import { MockupStyle, ClothingType } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    const imagePart = {
      inlineData: {
        mimeType: designImage.type,
        data: base64Image,
      },
    };

    let basePrompt = '';

    switch (style) {
      case 'male-model':
        basePrompt = `Create a photorealistic fashion mockup. A male model is wearing the exact ${clothingType} from the provided image. The model is in a bright, modern studio setting. The clothing should fit the model naturally, replacing any clothing they were wearing. The focus is on the clothing. High-resolution, detailed.`;
        break;
      case 'female-model':
        basePrompt = `Create a photorealistic fashion mockup. A female model is wearing the exact ${clothingType} from the provided image. The model is in a stylish urban outdoor setting with a slightly blurred background. The clothing should fit the model naturally, replacing any clothing they were wearing. The focus is on the clothing. High-resolution, detailed.`;
        break;
      case 'flat-lay':
        basePrompt = `Based on the provided image of a ${clothingType}, create a new, professional flat-lay product photograph of that same item. The ${clothingType} should be neatly folded on a clean, light-colored wooden surface. Add some complementary accessories like sunglasses or a small plant nearby. High-resolution, detailed lighting.`;
        break;
      case 'hanging':
        basePrompt = `Based on the provided image of a ${clothingType}, create a new, high-quality product shot of that same item. The ${clothingType} is on a simple wooden hanger against a clean, white brick wall. The lighting should be soft and natural, showing fabric texture. High-resolution, detailed.`;
        break;
    }

    if (customPrompt.trim()) {
        basePrompt += ` ${customPrompt.trim()}`;
    }
    
    const generatedImages: string[] = [];
    
    // Call the API twice to get two images
    for (let i = 0; i < 2; i++) {
        const textPart = { text: i === 0 ? basePrompt : `${basePrompt} Show a different angle or pose.` };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
    }
    
    if (generatedImages.length < 2) {
        throw new Error("Mockup generation failed to produce enough images.");
    }

    return generatedImages;

  } catch (error) {
    console.error("Error generating mockup:", error);
    throw new Error("Failed to generate mockup. Please try again.");
  }
};

export const editImage = async (
  baseImage: string,
  editPrompt: string
): Promise<string> => {
    try {
        const base64Data = baseImage.split(',')[1];
        const mimeType = baseImage.match(/data:(.*);/)?.[1] || 'image/jpeg';

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        };
        const textPart = { text: editPrompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image was generated in the edit response.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit the image. Please try a different prompt.");
    }
};
