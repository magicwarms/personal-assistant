// import { pipeline } from '@xenova/transformers';

import { UserKnowledge } from "./ollamaService";

const getEmbedding = async (text: string): Promise<any[]> => {
    const TransformersApi = Function('return import("@xenova/transformers")')();
    const { pipeline } = await TransformersApi;

    const extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
    );

    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

export default getEmbedding

// Usage
// const embedding = await getLocalEmbedding("User's favorite color is blue");
// console.log(embedding);  // [0.123, -0.078, ...] (384 dimensions)