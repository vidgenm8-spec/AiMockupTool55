const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenAI, Modality } = require("@google/genai");
const express = require("express");
const cors = require("cors");

// Initialize Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "20mb" })); // Increase limit for image uploads

// Initialize Gemini with the server-side API Key
// IMPORTANT: This uses the key defined in your functions/.env file.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Create a router to hold the routes
const router = express.Router();

router.post("/generateMockup", async (req, res) => {
  try {
    const { imageBase64, mimeType, style, clothingType, customPrompt } = req.body;

    if (!imageBase64 || !style || !clothingType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64,
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
      default:
        basePrompt = `Create a professional mockup of this ${clothingType}.`;
    }

    if (customPrompt && customPrompt.trim()) {
        basePrompt += ` ${customPrompt.trim()}`;
    }

    const generatedImages = [];
    
    // Generate 2 variations
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

    if (generatedImages.length === 0) {
        return res.status(500).json({ error: "Failed to generate images from the model." });
    }

    res.json({ images: generatedImages });

  } catch (error) {
    console.error("Error in generateMockup:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.post("/editImage", async (req, res) => {
  try {
    const { baseImage, editPrompt } = req.body;

    if (!baseImage || !editPrompt) {
        return res.status(400).json({ error: "Missing baseImage or editPrompt" });
    }

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

    let resultImage = null;
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            resultImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
        }
    }

    if (!resultImage) {
        return res.status(500).json({ error: "No image generated." });
    }

    res.json({ image: resultImage });

  } catch (error) {
    console.error("Error in editImage:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Mount the router. 
// We mount it at "/" for direct function calls and "/api" for Hosting rewrites
// that might preserve the /api prefix in the request path.
app.use("/", router);
app.use("/api", router);

exports.api = onRequest(app);