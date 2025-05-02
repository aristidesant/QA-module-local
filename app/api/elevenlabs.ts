import axios from 'axios';
import { ElevenLabsClient } from 'elevenlabs';

const ELEVENLABS_API_KEY = "sk_3e325a88eaf0b065bdc8e9633818aeb4379150fc709d5b64"

if (!ELEVENLABS_API_KEY) {
  throw new Error('ELEVENLABS_API_KEY environment variable is not set.');
}

const elevenLabsClient = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

export async function fetchModels() {
  try {
    const response = elevenLabsClient.conversationalAi.getAgents();
    console.log((await response).agents);
  } catch (error) {
    console.error('Error fetching models from ElevenLabs API:', error);
    throw error;
  }
} 