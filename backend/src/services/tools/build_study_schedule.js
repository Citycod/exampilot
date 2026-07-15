const declaration = {
  name: 'build_study_schedule',
  description: 'Build a day-by-day study schedule across topics given an exam date and available hours per day.',
  parameters: {
    type: 'OBJECT',
    properties: {
      topics: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'List of topics to study'
      },
      examDate: {
        type: 'STRING',
        description: 'ISO date string of the exam'
      },
      hoursPerDay: {
        type: 'NUMBER',
        description: 'Number of hours the student can study per day'
      }
    },
    required: ['topics', 'examDate', 'hoursPerDay']
  }
};

const execute = async ({ topics, examDate, hoursPerDay }) => {
  const targetDate = new Date(examDate);
  const today = new Date();

  if (isNaN(targetDate.getTime())) {
    return { error: 'Invalid examDate provided. Please provide a valid ISO date string.' };
  }

  if (targetDate <= today) {
    return { error: 'The exam date is in the past. Cannot build a schedule.' };
  }

  const timeDiff = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysRemaining < 1) {
     return { error: 'Not enough days remaining to build a schedule.' };
  }

  const schedule = [];
  let topicIndex = 0;
  
  // Build schedule for the remaining days (up to a max of 30 days to avoid huge payloads)
  const daysToSchedule = Math.min(daysRemaining, 30);

  for (let i = 0; i < daysToSchedule; i++) {
    const scheduleDate = new Date();
    scheduleDate.setDate(today.getDate() + i);

    schedule.push({
      day: i + 1,
      date: scheduleDate.toISOString().split('T')[0],
      topic: topics[topicIndex % topics.length],
      hours: hoursPerDay
    });

    topicIndex++;
  }

  return { schedule };
};

module.exports = { declaration, execute };
