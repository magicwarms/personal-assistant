import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../config';
import getEmbedding from './embeddingService';
import crypto from 'crypto'
import { UserKnowledge } from './ollamaService';

const pinecone = new Pinecone({ apiKey: CONFIG.PINECONE_API_KEY! });
const index = pinecone.Index('knowledge-base');

const inputKnowledge = async (params: UserKnowledge) => {
    const queryEmbedding = await getEmbedding(params.category);
    console.log({ queryEmbedding });
    await index.upsert([
        {
            id: crypto.randomUUID(),
            values: queryEmbedding,
            metadata: params
        }
    ]);

    return
}

const retrieveKnowledge = async (userQuery: string) => {
    // Embed the query (use OpenAI, Hugging Face, etc.)
    const queryEmbedding = await getEmbedding(userQuery);

    // Query the vector DB for relevant knowledge
    const results = await index.query({
        vector: queryEmbedding,
        topK: 3, // Retrieve top 3 relevant facts
        includeMetadata: true
    });

    // Extract knowledge from results
    return results.matches.map(match => match.metadata!.text);
}

export default {
    retrieveKnowledge,
    inputKnowledge
}