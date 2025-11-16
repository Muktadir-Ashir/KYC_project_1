import { IKYC } from '../models/KYC';

/**
 * Generates an AI summary from KYC data using Hugging Face API
 * @param kycData - The KYC data to summarize
 * @returns Promise with the generated summary text
 */
export const generateAISummary = async (kycData: Partial<IKYC>): Promise<string> => {
  try {
    const apiKey = process.env.HUGGING_FACE_API_KEY;

    if (!apiKey) {
      console.warn('Hugging Face API key not configured, using placeholder summary');
      return `KYC submission for ${kycData.fullName} received and pending verification.`;
    }

    // Construct the prompt for the LLM
    const prompt = `Given the following KYC (Know Your Customer) information:
- Full Name: ${kycData.fullName}
- Email: ${kycData.email}
- Phone: ${kycData.phone}
- Date of Birth: ${kycData.dateOfBirth}
- Address: ${kycData.address}
- ID Number: ${kycData.idNumber}

Generate a concise 2-3 sentence summary suitable for KYC verification purposes. The summary should include the applicant's name and a brief statement confirming the information has been submitted for verification.

Summary:`;

    // Call Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
      headers: { Authorization: `Bearer ${apiKey}` },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt, parameters: { max_length: 200, temperature: 0.7 } }),
    });

    if (!response.ok) {
      console.error('Hugging Face API error:', response.statusText);
      return `KYC submission for ${kycData.fullName} received and pending verification.`;
    }

    const result = await response.json();

    // Extract the generated text from the response
    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      // Extract only the generated part (remove the original prompt)
      let generatedText = result[0].generated_text;
      const summaryStart = generatedText.indexOf('Summary:');
      if (summaryStart !== -1) {
        generatedText = generatedText.substring(summaryStart + 8).trim();
      }
      // Clean up the text - remove any extra whitespace
      return generatedText.substring(0, 300).trim();
    }

    console.error('Unexpected Hugging Face response format:', result);
    return `KYC submission for ${kycData.fullName} received and pending verification.`;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    // Return a fallback summary if the API call fails
    return `KYC submission for ${kycData.fullName} received and pending verification.`;
  }
};
