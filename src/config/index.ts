export const CONFIG = {
    PORT: process.env.PORT || 3000,
    OLLAMA_API_URL: 'http://localhost:11434/v1',
    MODEL_NAME: 'deepseek-r1:14b', // Replace with your model name
    // MODEL_NAME: 'llama3.2-vision', // Replace with your model name
    UPLOAD_DIR: './uploads',
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
};
