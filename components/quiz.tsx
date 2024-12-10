import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ChevronRight,
  Check,
  X,
  RefreshCw,
  FileText,
  BookOpen,
} from 'lucide-react';
import QuizScore from './score';
import QuizReview from './quiz-overview';
import { Question } from '@/lib/schemas';
import { Card, CardContent } from '@/components/ui/card';

type QuizProps = {
  questions: Question[];
  clearPDF: () => void;
  title: string;
  onNeedMoreQuestions: () => Promise<Question[]>;
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
  questions: initialQuestions,
  clearPDF,
  title = 'Quiz',
  onNeedMoreQuestions,
}: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Preload more questions when we're 2 questions away from the end
  useEffect(() => {
    const loadMoreIfNeeded = async () => {
      if (
        currentQuestionIndex >= questions.length - 2 &&
        !isLoadingMore &&
        !isComplete
      ) {
        setIsLoadingMore(true);
        try {
          const newQuestions = await onNeedMoreQuestions();
          setQuestions((prevQuestions) => [...prevQuestions, ...newQuestions]);
        } catch (error) {
          console.error('Failed to load more questions:', error);
        }
        setIsLoadingMore(false);
      }
    };
    loadMoreIfNeeded();
  }, [currentQuestionIndex, questions.length, isLoadingMore, isComplete]);

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
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setHasAnswered(false);
    setFeedbackMessage('');
    setShowExplanation(false);
  };

  const handleShowResults = () => {
    setIsComplete(true);
  };

  const handleReset = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setHasAnswered(false);
    setIsComplete(false);
    setProgress(0);
    setQuestions(initialQuestions);
    setShowExplanation(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = answers[currentQuestionIndex];
  const answerLabels = ['A', 'B', 'C', 'D'];

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
                      <>
                        <div
                          className={`text-center font-medium text-lg ${
                            feedbackMessage.includes('Correct')
                              ? 'text-green-500 dark:text-green-400'
                              : 'text-red-500 dark:text-red-400'
                          }`}
                        >
                          {feedbackMessage}
                        </div>
                        {!feedbackMessage.includes('Correct') &&
                          !showExplanation && (
                            <div className='flex justify-center'>
                              <Button
                                onClick={() => setShowExplanation(true)}
                                variant='outline'
                                className='bg-muted'
                              >
                                <BookOpen className='mr-2 h-4 w-4' />
                                Explain This Concept
                              </Button>
                            </div>
                          )}
                        {showExplanation && (
                          <Card className='bg-muted'>
                            <CardContent className='pt-6'>
                              <h3 className='font-semibold mb-2'>
                                Explanation:
                              </h3>
                              <p className='text-muted-foreground whitespace-pre-wrap'>
                                {currentQuestion.explanation}
                              </p>
                              <div className='mt-4 text-sm text-muted-foreground'>
                                <p>
                                  <span className='font-medium'>
                                    Your answer:
                                  </span>{' '}
                                  Option {userAnswer} -{' '}
                                  {
                                    currentQuestion.options[
                                      answerLabels.indexOf(userAnswer)
                                    ]
                                  }
                                </p>
                                <p>
                                  <span className='font-medium'>
                                    Correct answer:
                                  </span>{' '}
                                  Option {currentQuestion.answer} -{' '}
                                  {
                                    currentQuestion.options[
                                      answerLabels.indexOf(
                                        currentQuestion.answer
                                      )
                                    ]
                                  }
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                    <div className='flex justify-between items-center pt-4'>
                      <span className='text-sm font-medium'>
                        Question {currentQuestionIndex + 1}
                      </span>
                      <div className='space-x-4'>
                        {hasAnswered && (
                          <Button onClick={handleNextQuestion} variant='ghost'>
                            Next Question{' '}
                            <ChevronRight className='ml-2 h-4 w-4' />
                          </Button>
                        )}
                        <Button onClick={handleShowResults} variant='outline'>
                          Show Results
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-8'>
                    <QuizScore
                      correctAnswers={score}
                      totalQuestions={answers.length}
                    />
                    <QuizReview
                      questions={questions.slice(0, answers.length)}
                      userAnswers={answers}
                    />
                    <div className='flex justify-center space-x-4 pt-4'>
                      <Button
                        onClick={handleReset}
                        variant='outline'
                        className='bg-muted hover:bg-muted/80 w-full'
                      >
                        <RefreshCw className='mr-2 h-4 w-4' /> Continue Quiz
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
