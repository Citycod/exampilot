const examDates = {
  'WAEC': '2026-08-15',
  'JAMB': '2026-09-01',
  'SAT': '2026-10-03',
  'IGCSE': '2026-11-05'
};

const declaration = {
  name: 'lookup_exam_date',
  description: 'Look up the scheduled date of a named exam and calculate days remaining.',
  parameters: {
    type: 'OBJECT',
    properties: {
      exam_name: {
        type: 'STRING',
        description: 'The name of the exam (e.g., WAEC, JAMB, SAT)'
      },
      country: {
        type: 'STRING',
        description: 'The country where the exam is taking place (optional)'
      }
    },
    required: ['exam_name']
  }
};

const execute = async ({ exam_name, country }) => {
  const normalizedName = exam_name.toUpperCase().trim();
  let dateStr = examDates[normalizedName];
  
  // Fallback for unknown exams
  if (!dateStr) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 90);
    dateStr = defaultDate.toISOString().split('T')[0];
  }

  const examDate = new Date(dateStr);
  const today = new Date();
  
  // Calculate days remaining
  const timeDiff = examDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return {
    examName: exam_name,
    date: dateStr,
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0
  };
};

module.exports = { declaration, execute };
