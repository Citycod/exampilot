const crypto = require('crypto');

const declaration = {
  name: 'generate_practice_questions',
  description: 'Generate practice questions on a topic at a given difficulty.',
  parameters: {
    type: 'OBJECT',
    properties: {
      subject: {
        type: 'STRING',
        description: 'The subject area (e.g., Math, Physics)'
      },
      topic: {
        type: 'STRING',
        description: 'The specific topic within the subject (e.g., Algebra, Kinematics)'
      },
      difficulty: {
        type: 'STRING',
        description: 'Difficulty level: easy, medium, or hard',
        enum: ['easy', 'medium', 'hard']
      },
      count: {
        type: 'INTEGER',
        description: 'Number of questions to generate (default 3, max 10)'
      }
    },
    required: ['subject', 'topic', 'difficulty']
  }
};

const execute = async ({ subject, topic, difficulty, count = 3 }) => {
  // Validate count bounds silently
  let validCount = count;
  if (validCount < 1) validCount = 1;
  if (validCount > 10) validCount = 10;

  // Since we don't want to make nested LLM calls for this assessment if we can avoid it,
  // we will structure a prompt fragment that Gemini will use in its final response to generate the text.
  // Alternatively, we could hardcode some generic questions. 
  // Let's return a structured prompt fragment instructing the LLM to write them.
  
  const questions = [];
  for(let i=0; i<validCount; i++) {
    questions.push({
      id: crypto.randomUUID(),
      instruction_to_model: `Please generate a ${difficulty} practice question about ${topic} in ${subject}.`,
      difficulty: difficulty
    });
  }

  return { questions };
};

module.exports = { declaration, execute };
