const lookupExamDate = require('./lookup_exam_date');
const generatePracticeQuestions = require('./generate_practice_questions');
const gradeAnswer = require('./grade_answer');
const buildStudySchedule = require('./build_study_schedule');

const tools = {
  lookup_exam_date: lookupExamDate,
  generate_practice_questions: generatePracticeQuestions,
  grade_answer: gradeAnswer,
  build_study_schedule: buildStudySchedule
};

const toolDeclarations = Object.values(tools).map(t => t.declaration);

module.exports = {
  tools,
  toolDeclarations
};
