const { ai } = require('../config/gemini');
const env = require('../config/env');
const { tools, toolDeclarations } = require('./tools');

const SYSTEM_PROMPT = `
You are ExamPilot, an AI-powered exam-prep assistant for students.
You have tools to:
1. lookup_exam_date: Check the date of an exam.
2. build_study_schedule: Build a study schedule based on the exam date.
3. generate_practice_questions: Generate practice questions for a topic.
4. grade_answer: Grade a student's answer to a question.

Always be helpful and encouraging. Use the tools provided when requested by the user.
If a user asks for an exam date and then a study schedule, use the tools in sequence.
`;

const processChat = async (messages) => {
  try {
    // Format messages for @google/genai SDK format
    // Expects: [{ role: 'user' | 'model', parts: [{ text: "..." }] }]
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: msg.parts || [{ text: msg.text }]
    }));

    // Add system instruction as the first message part if supported, 
    // or we can inject it via config.systemInstruction
    
    let isDone = false;
    let finalResponse = '';
    let toolCallsTriggered = [];

    while (!isDone) {
      const response = await ai.models.generateContent({
        model: env.geminiModel,
        contents: formattedMessages,
        config: {
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          tools: [{ functionDeclarations: toolDeclarations }]
        }
      });

      const call = response.functionCalls && response.functionCalls[0];
      
      if (call) {
        // Model decided to call a function
        const functionName = call.name;
        const functionArgs = call.args;
        
        toolCallsTriggered.push({ name: functionName, args: functionArgs });

        let result;
        try {
          if (tools[functionName]) {
            result = await tools[functionName].execute(functionArgs);
          } else {
            result = { error: `Unknown tool: ${functionName}` };
          }
        } catch (error) {
          result = { error: `Error executing tool: ${error.message}` };
        }

        // Add the model's exact response to history to preserve thought_signature etc.
        formattedMessages.push({
          role: 'model',
          parts: response.candidates[0].content.parts
        });

        // Add the tool response to history
        formattedMessages.push({
          role: 'user', // Note: in some versions of the SDK, function responses come from 'user' or 'tool' role. We use 'user' with functionResponse part.
          parts: [{
            functionResponse: {
              name: functionName,
              response: result
            }
          }]
        });
        
        // Loop continues to let model process the function response
      } else {
        // No function call, we have the final text
        finalResponse = response.text || '';
        
        // Add final response to history
        formattedMessages.push({
          role: 'model',
          parts: [{ text: finalResponse }]
        });
        isDone = true;
      }
    }

    return {
      text: finalResponse,
      toolCalls: toolCallsTriggered,
      messages: formattedMessages
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to communicate with AI service: ' + error.message);
  }
};

module.exports = { processChat };
