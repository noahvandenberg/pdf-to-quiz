import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  FileText,
} from 'lucide-react';
import QuizScore from './score';
import QuizReview from './quiz-overview';
import { Question } from '@/lib/schemas';

type QuizProps = {
  questions: Question[];
  clearPDF: () => void;
  title: string;
};

const QuestionCard: React.FC<{
  question: Question;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  showCorrectAnswer: boolean;
}> = ({ question, selectedAnswer, onSelectAnswer, showCorrectAnswer }) => {
  const answerLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className='space-y-6'>
      <h2 className='text-lg font-semibold leading-tight'>
        {question.question}
      </h2>
      <div className='grid grid-cols-1 gap-4'>
        {question.options.map((option, index) => {
          const currentLabel = answerLabels[index];
          const isCorrect = currentLabel === question.answer;
          const isSelected = currentLabel === selectedAnswer;
          const isIncorrectSelection = isSelected && !isCorrect;

          return (
            <Button
              key={index}
              variant='outline'
              className={`h-auto py-6 px-4 justify-start text-left whitespace-normal ${
                showCorrectAnswer
                  ? isCorrect
                    ? 'bg-green-100 dark:bg-green-700/50 hover:bg-green-100 dark:hover:bg-green-700/50'
                    : isIncorrectSelection
                    ? 'bg-red-100 dark:bg-red-700/50 hover:bg-red-100 dark:hover:bg-red-700/50'
                    : 'hover:bg-accent'
                  : isSelected
                  ? 'bg-secondary'
                  : ''
              }`}
              onClick={() => !showCorrectAnswer && onSelectAnswer(currentLabel)}
            >
              <span className='text-lg font-medium mr-4 shrink-0'>
                {currentLabel}
              </span>
              <span className='flex-grow'>{option}</span>
              {showCorrectAnswer && isCorrect && (
                <Check
                  className='ml-2 shrink-0 text-green-600 dark:text-green-400'
                  size={20}
                />
              )}
              {showCorrectAnswer && isIncorrectSelection && (
                <X
                  className='ml-2 shrink-0 text-red-600 dark:text-red-400'
                  size={20}
                />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default function Quiz({
  questions,
  clearPDF,
  title = 'Quiz',
}: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill(null)
  );
  const [score, setScore] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((currentQuestionIndex / questions.length) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, questions.length]);

  const handleSelectAnswer = (answer: string) => {
    if (!hasAnswered) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = answer;
      setAnswers(newAnswers);
      setHasAnswered(true);

      // Update score and feedback immediately
      const isCorrect = answer === questions[currentQuestionIndex].answer;
      if (isCorrect) {
        setScore((prev) => prev + 1);
        setFeedbackMessage('Correct! 🎉');
      } else {
        setFeedbackMessage(
          `Incorrect. The correct answer was ${questions[currentQuestionIndex].answer}`
        );
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setHasAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleReset = () => {
    setAnswers(Array(questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setScore(0);
    setHasAnswered(false);
    setIsComplete(false);
    setProgress(0);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <main className='container mx-auto px-4 py-12 max-w-4xl'>
        <h1 className='text-3xl font-bold mb-8 text-center text-foreground'>
          {title}
        </h1>
        <div className='relative'>
          {!isComplete && <Progress value={progress} className='h-1 mb-8' />}
          <div className='min-h-[400px]'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={isComplete ? 'results' : currentQuestionIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {!isComplete ? (
                  <div className='space-y-8'>
                    <QuestionCard
                      question={currentQuestion}
                      selectedAnswer={answers[currentQuestionIndex]}
                      onSelectAnswer={handleSelectAnswer}
                      showCorrectAnswer={hasAnswered}
                    />
                    {hasAnswered && (
                      <div
                        className={`text-center font-medium text-lg ${
                          feedbackMessage.includes('Correct')
                            ? 'text-green-500 dark:text-green-400'
                            : 'text-red-500 dark:text-red-400'
                        }`}
                      >
                        {feedbackMessage}
                      </div>
                    )}
                    <div className='flex justify-between items-center pt-4'>
                      <span className='text-sm font-medium'>
                        Question {currentQuestionIndex + 1} of{' '}
                        {questions.length}
                      </span>
                      {hasAnswered && (
                        <Button
                          onClick={() => {
                            handleNextQuestion();
                            setFeedbackMessage(''); // Clear feedback when moving to next question
                          }}
                          variant='ghost'
                        >
                          {currentQuestionIndex === questions.length - 1
                            ? 'See Results'
                            : 'Next Question'}{' '}
                          <ChevronRight className='ml-2 h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='space-y-8'>
                    <QuizScore
                      correctAnswers={score}
                      totalQuestions={questions.length}
                    />
                    <QuizReview questions={questions} userAnswers={answers} />
                    <div className='flex justify-center space-x-4 pt-4'>
                      <Button
                        onClick={() => {
                          handleReset();
                          setFeedbackMessage(''); // Clear feedback on reset
                        }}
                        variant='outline'
                        className='bg-muted hover:bg-muted/80 w-full'
                      >
                        <RefreshCw className='mr-2 h-4 w-4' /> Try Again
                      </Button>
                      <Button
                        onClick={clearPDF}
                        className='bg-primary hover:bg-primary/90 w-full'
                      >
                        <FileText className='mr-2 h-4 w-4' /> Try Another PDF
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
