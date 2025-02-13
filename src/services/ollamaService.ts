import ollama from 'ollama'
import { CONFIG } from '../config';
import prompts from '../prompts';
import pineconeService from './pineconeService';

type AgentAction = {
    thought: {
        analysis: string,
        emotional_state: string,
        hidden_context: string
    }
    params: AgentActionDetail
    response: {
        main: string,
        emotional_tone: string
    }
    actions: {
        tool: string,
        params: object,
        priority: string
    }[],
}

type AgentActionDetail = {
    parameters: string,
    details?: string
}

// MemoryEntry: Represents a single memory/context entry
export type MemoryEntry = {
    timestamp: string; // ISO8601 format
    type: 'user' | 'system' | 'tool'; // Who generated the message
    content: string; // The actual message/content
    metadata?: {
        sentiment?: 'positive' | 'neutral' | 'negative'; // Optional sentiment analysis
        urgency?: 'low' | 'medium' | 'high'; // Optional urgency level
        contextTags?: string[]; // Tags for better context retrieval (e.g., ["work", "stress"])
    };
}

const dateToIsoString = () => new Date().toISOString();

// UserKnowledge: Represents a single piece of knowledge about the user
export type UserKnowledge = {
    category: string; // Type of knowledge (e.g., "preferences", "health", "relationships")
    details: string; // Specific information (e.g., "favorite color: blue")
    source: 'user' | 'inferred'; // How the knowledge was obtained
    lastUpdated: string; // ISO8601 timestamp
    confidenceLevel?: number; // Optional confidence score (0-1)
}

// Agent Components
const agentConfig = {
    memory: [] as MemoryEntry[], // Conversation history
    knowledge: [] as UserKnowledge[], // Vector store/RAG would go here
    tools: {
        reminder_set: (message: AgentActionDetail) => {
            // "description": "Set temporal reminders",
            // "params: { "datetime": "ISO8601", "message": string }
            return { datetime: dateToIsoString(), message: message.parameters }
        },
        web_search: (query: AgentActionDetail) => {
            // "description": "Access real-time information",
            // "params: { "query": string, "depth": "brief | detailed" }
            return { query: query.parameters }
        },
        sentiment_analyzer: (text: AgentActionDetail) => {
            // "description": "Detect user emotional state",
            // "params: { "text": "latest user message" }

            console.log({ sentiment_analyzer: text })

            return { text: text.parameters }
        },
        knowledge_update: (params: AgentActionDetail) => {
            // "description": "Store new personal preferences/facts",
            // "params: { "category": string, "details": string }
            // agentConfig.knowledge.push({
            //     category: params.parameters,
            //     details: params.details!,
            //     source: 'user',
            //     lastUpdated: dateToIsoString()
            // })

            const userFacts: UserKnowledge = {
                category: params.parameters,
                details: params.details!,
                source: 'user',
                lastUpdated: dateToIsoString()
            }

            pineconeService.inputKnowledge(userFacts);

            return userFacts
        },
        calendar_check: (timeRange: AgentActionDetail) => {
            // "description": "Interface with digital calendar",
            // "params: { "time_range": "day | week | month" }
            return { timeRange: timeRange.parameters }
        },
        communication: (params: AgentActionDetail) => {
            // "description": "Send emails/SMS",
            // "params: { "recipient": string, "message": string }
            return { recipient: params.parameters, message: params.details }
        }
    }
};

const generatePlanner = async (userInput: string) => {
    try {

        // Retrieve relevant knowledge
        const knowledges = await pineconeService.retrieveKnowledge(userInput);
        console.log({ knowledges });
        const messages = [{
            role: 'system',
            content: prompts.systemPrompt(agentConfig.memory, agentConfig.knowledge, userInput)
        }, {
            role: 'user',
            content: userInput
        }];

        console.log({ messages });
        const response = await ollama.chat({
            model: CONFIG.MODEL_NAME!,
            format: 'json',
            messages,
        })
        const agentAction: AgentAction = JSON.parse(response.message.content);
        console.log({ agentAction });
        console.log({ actionWAK: JSON.stringify(agentAction.actions) });
        if (agentAction.actions && agentAction.actions.length && agentAction.actions[0].tool) {
            const toolResult = (agentConfig.tools as { [key: string]: (params: AgentActionDetail) => any })[agentAction.actions[0].tool](agentAction.actions[0].params as AgentActionDetail);

            console.log({ toolResult });

            agentConfig.memory.push({ timestamp: dateToIsoString(), type: "system", content: agentAction.response.main });

            return agentAction.response.main;
        }

        agentConfig.memory.push({ timestamp: dateToIsoString(), type: "system", content: agentAction.response.main });

        return agentAction.response.main;
    } catch (error: any) {
        console.error(`Failed to generate response: ${error.message}`);
        return "Sorry, there was an error processing your request.";
    }
}

export default {
    generatePlanner,
    agentConfig
}