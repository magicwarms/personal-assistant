import ollama from 'ollama'
import { CONFIG } from '../config';
import prompts from '../prompts';
import pineconeService from './pineconeService';

type AgentAction = {
    thought: string,
    action: keyof typeof agentConfig.tools | null,
    params: string,
    response: string
}

export type MemoryEntry = {
    user: string;
    result: any;
}

// Agent Components
const agentConfig = {
    memory: [] as MemoryEntry[], // Conversation history
    knowledge: [] as string[], // Vector store/RAG would go here
    tools: {
        // web_search: (query: string) => { return query },
        weather: (location: string): string => {
            console.log({ locationLAGIAKSES: location })
            return location ?? `The current weather in ${location} is sunny with a high of 22°C.`
        },
        knowledge_input: (knowledge: string) => {
            console.log({ knowledgeLAGIAKSES: knowledge })

            agentConfig.knowledge.push(knowledge);
            return
        },
        // calculator: <Type>(arg: Type): Type => { return arg },
    }
};

const generatePlanner = async (userInput: string) => {
    try {

        // Retrieve relevant knowledge
        // const knowledge = await pineconeService.retrieveKnowledge(userInput);

        const messages = [{
            role: 'system',
            content: prompts.systemPrompt(agentConfig.memory, agentConfig.knowledge, userInput)
        }, {
            role: 'user',
            content: userInput
        }];

        console.log({ messages });
        const response = await ollama.chat({
            model: CONFIG.MODEL_NAME,
            format: 'json',
            messages,
            keep_alive: '1.5h',
        })

        const agentAction: AgentAction = JSON.parse(response.message.content);
        console.log({ agentAction });
        if (agentAction.action && agentAction.params) {
            const toolResult = agentConfig.tools[agentAction.action](agentAction.params);
            agentConfig.memory.push({ user: userInput, result: agentAction.response });

            if (agentAction.action === 'knowledge_input') {
                // const input =

                return agentAction.response ?? agentAction.thought
            }

            return toolResult;
        }

        agentConfig.memory.push({ user: userInput, result: agentAction.response });

        return agentAction.response;
    } catch (error: any) {
        throw new Error(`Failed to generate response: ${error.message}`);
    }
}

export default {
    generatePlanner,
    agentConfig
}