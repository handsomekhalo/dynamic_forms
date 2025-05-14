import CreateQuestionForm from './create_question_form_component';
import ManageQuestions from './question_management';

export default function QuestionCard({ questions, questionTypes }) {
  return (
    <div className="card bg-white p-4">
      <fieldset className="border border-primary mt-4 p-4 mb-4">
        <legend className="float-none w-auto text-md">Create Questions</legend>
        <CreateQuestionForm questionTypes={questionTypes} />
      </fieldset>

      <fieldset className="border border-primary mt-4 p-4 mb-4">
        <legend className="float-none w-auto text-md">Manage Questions</legend>
        <ManageQuestions questions={questions} />
      </fieldset>
    </div>
  );
}
