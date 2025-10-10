"use server";
import { GoogleGenAI } from "@google/genai";
import { ensureUserInDatabase } from "@/lib/userSync";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";
// Function to convert File to base64
async function fileToBase64(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function processVehicleImageWithAI(imageFile: File) {
  try {
    const user = await ensureUserInDatabase();

    if (!user) {
      throw new Error(
        "Unauthorized. Please create an account or log in to use this feature."
      );
    }
    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Initialize Gemini API
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // console.log(await genAI.models.list());
    // Convert image file to base64
    const base64Image = await fileToBase64(imageFile);

    // Create image part for the model
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type,
      },
    };

    // Define the prompt for car search extraction
    const prompt = `
      You are an expert automotive AI. Analyze the provided car image and extract the following details:

      - "make": The manufacturer of the car (e.g., Toyota, BMW, Ford).
      - "bodyType": The body style (e.g., SUV, Sedan, Hatchback, Coupe, Convertible, Truck, Van, Wagon).
      - "color": The primary exterior color of the car (e.g., red, blue, black, white, silver).

      Respond with a single, valid JSON object in this format:
      {
      "make": "<manufacturer>",
      "bodyType": "<body style>",
      "color": "<color>",
      "confidence": <number between 0 and 1>
      }

      - "confidence" should be a number between 0 and 1 indicating your overall certainty about the extracted details.
      - Do not include any explanation, extra text, or markdown formatting—only the JSON object.
      - If you are unsure about a field, leave it as an empty string and adjust the confidence accordingly.
    `;

    // Get response from Gemini
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [imagePart, { text: prompt }],
    });
    // const response = { text: "test" };
    const text = response.text;
    const cleanedText = text?.replace(/```(?:json)?\n?/g, "").trim();

    // Parse the JSON response
    try {
      const carDetails = JSON.parse(cleanedText || "{}");

      // Return success response with data
      return {
        success: true,
        data: carDetails,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error: any) {
    throw new Error("AI Search error:" + error.message);
  }
}
