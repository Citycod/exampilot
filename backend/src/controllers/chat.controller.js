const { getSession, createSession, addMessageToSession } = require('../store/session.store');
const { processChat } = require('../services/gemini.service');
const { toolDeclarations } = require('../services/tools');

const chat = async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  let currentSessionId = sessionId;
  let sessionMessages = [];

  if (currentSessionId) {
    sessionMessages = getSession(currentSessionId);
    if (!sessionMessages) {
      return res.status(404).json({ error: 'Session not found' });
    }
  } else {
    currentSessionId = createSession();
    sessionMessages = getSession(currentSessionId);
  }

  // Add user message to local history (simplified format for frontend)
  const userMessage = { role: 'user', text: message };
  addMessageToSession(currentSessionId, userMessage);
  
  // Format history for Gemini (only use the text parts for simplicity, or keep full history)
  // For this assessment, we'll keep it simple and just send the raw history we've built
  // Actually gemini.service expects [{role, text}] and adds parts
  
  try {
    const result = await processChat(sessionMessages);
    
    // Add final response to local history
    addMessageToSession(currentSessionId, {
      role: 'assistant',
      text: result.text,
      toolCalls: result.toolCalls
    });

    res.json({
      sessionId: currentSessionId,
      message: result.text,
      toolCalls: result.toolCalls
    });
  } catch (error) {
    console.error(error);
    // Remove the last user message if the request failed so they can retry
    sessionMessages.pop();
    res.status(500).json({ error: error.message });
  }
};

const getChatHistory = (req, res) => {
  const { sessionId } = req.params;
  const sessionMessages = getSession(sessionId);

  if (!sessionMessages) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({ history: sessionMessages });
};

const getTools = (req, res) => {
  res.json({ tools: toolDeclarations });
};

module.exports = { chat, getChatHistory, getTools };
