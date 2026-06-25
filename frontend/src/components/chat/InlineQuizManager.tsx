import { useState } from "react";
import IrisAskBlock from "./IrisAskBlock";

interface InlineQuizManagerProps {
  questions: any[];
  onComplete: (formattedAnswers: string) => void;
  isHistorical?: boolean;
}

export const InlineQuizManager = ({ questions, onComplete, isHistorical = false }: InlineQuizManagerProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isHistorical) return null;

  // The first question that hasn't been answered yet
  const firstUnansweredIndex = questions.findIndex((_, i) => !answers[i.toString()]);
  
  // If all answered, activeIndex is -1.
  const activeIndex = firstUnansweredIndex === -1 ? -1 : firstUnansweredIndex;

  const handleAnswer = (index: number, ans: string) => {
    const newAnswers = { ...answers, [index.toString()]: ans };
    setAnswers(newAnswers);

    // If this was the last question, submit
    if (Object.keys(newAnswers).length === questions.length && !isSubmitted) {
      setIsSubmitted(true);
      const formattedAnswers = questions.map((q: any, i: number) => {
        const userAns = newAnswers[i.toString()];
        return `Question: ${q.question}\nOptions: ${q.options.join(", ")}\nUser's Answer: ${userAns}`;
      }).join("\n\n");
      onComplete(`[System: User submitted quiz]\n${formattedAnswers}\nPlease evaluate my answers.`);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {questions.map((q, index) => {
        const isAnswered = !!answers[index.toString()];
        const chosen = answers[index.toString()] ?? null;
        const isActive = index === activeIndex;
        const isPending = !isAnswered && !isActive;

        if (isPending) return null;

        return (
          <div key={index} className="iris-ask-container mb-2">
            <div className="text-[10px] text-violet-400 font-bold uppercase tracking-widest mb-1.5 ml-1 opacity-70">
              Question {index + 1} of {questions.length}
            </div>
            <IrisAskBlock
              segment={{ kind: "ask", question: q.question, options: q.options }}
              answered={isAnswered}
              chosenAnswer={chosen}
              onAnswer={(ans) => handleAnswer(index, ans)}
            />
          </div>
        );
      })}
    </div>
  );
};
