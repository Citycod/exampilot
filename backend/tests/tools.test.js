const { execute: gradeAnswer } = require('../src/services/tools/grade_answer');
const { execute: buildSchedule } = require('../src/services/tools/build_study_schedule');

describe('Tools Execution', () => {
  describe('grade_answer', () => {
    it('grades a short answer with a low score', async () => {
      const result = await gradeAnswer({
        question: 'What is photosynthesis?',
        submittedAnswer: 'sun'
      });
      expect(result.score).toBe(20);
      expect(result.feedback).toContain('too short');
    });

    it('grades a well-reasoned answer with a high score', async () => {
      const result = await gradeAnswer({
        question: 'Why is the sky blue?',
        submittedAnswer: 'The sky is blue because of Rayleigh scattering.'
      });
      expect(result.score).toBe(85);
      expect(result.feedback).toContain('Good reasoning');
    });
  });

  describe('build_study_schedule', () => {
    it('returns an error for past dates', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      const result = await buildSchedule({
        topics: ['Math'],
        examDate: pastDate.toISOString(),
        hoursPerDay: 2
      });

      expect(result.error).toContain('past');
    });

    it('builds a valid schedule for future dates', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5); // 5 days from now
      
      const result = await buildSchedule({
        topics: ['Math', 'Physics'],
        examDate: futureDate.toISOString(),
        hoursPerDay: 2
      });

      expect(result.error).toBeUndefined();
      expect(result.schedule.length).toBeGreaterThan(0);
      expect(result.schedule[0].topic).toBe('Math');
      expect(result.schedule[1].topic).toBe('Physics');
      expect(result.schedule[0].hours).toBe(2);
    });
  });
});
