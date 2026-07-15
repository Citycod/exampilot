const crypto = require('crypto');

// In-memory store for chat sessions
// A Map where key is sessionId and value is an array of messages
// Each message: { role: 'user' | 'model', text: string, data?: object }
const sessions = new Map();

module.exports = {
  sessions,
  createSession: () => {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, []);
    return sessionId;
  },
  getSession: (sessionId) => {
    return sessions.get(sessionId);
  },
  addMessageToSession: (sessionId, message) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.push(message);
    }
  }
};
