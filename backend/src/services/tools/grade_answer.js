const declaration = {
  name: 'grade_answer',
  description: 'Grade a student\'s submitted answer against a simple rubric and return a score + feedback.',
  parameters: {
    type: 'OBJECT',
    properties: {
      question: {
        type: 'STRING',
        description: 'The original question being answered'
      },
      submittedAnswer: {
        type: 'STRING',
        description: 'The answer submitted by the student'
      },
      rubric: {
        type: 'STRING',
        description: 'The grading rubric to apply. Optional.'
      }
    },
    required: ['question', 'submittedAnswer']
  }
};

const execute = async ({ question, submittedAnswer, rubric }) => {
  // Deterministic mock grading logic for testing without LLM calls
  let score = 50;
  let strengths = [];
  let improvements = [];
  let feedback = '';

  const answerLength = submittedAnswer.trim().length;

  if (answerLength < 10) {
    score = 20;
    feedback = 'Your answer is too short to fully address the question.';
    improvements.push('Provide more detail.');
  } else if (submittedAnswer.toLowerCase().includes('because') || submittedAnswer.toLowerCase().includes('therefore')) {
    score = 85;
    feedback = 'Good reasoning provided in the answer.';
    strengths.push('Logical structure and explanation.');
    improvements.push('Consider adding specific examples.');
  } else {
    score = 70;
    feedback = 'A decent attempt, but could be structured better.';
    strengths.push('Direct response to the prompt.');
    improvements.push('Use transitional words to connect ideas.');
  }

  return {
    score,
    feedback,
    strengths,
    improvements
  };
};

module.exports = { declaration, execute };
