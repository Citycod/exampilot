export default function ToolCallIndicator({ toolName }) {
  let message = "Working...";
  let icon = "⚙️";

  if (toolName === 'lookup_exam_date') {
    message = "Checking the exam date...";
    icon = "📅";
  } else if (toolName === 'generate_practice_questions') {
    message = "Generating practice questions...";
    icon = "✍️";
  } else if (toolName === 'grade_answer') {
    message = "Grading your answer...";
    icon = "📝";
  } else if (toolName === 'build_study_schedule') {
    message = "Building your study schedule...";
    icon = "🗓️";
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 my-2 animate-pulse">
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
}
