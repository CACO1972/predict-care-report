import { useMemo } from 'react';

export type RioExpression = 'smile' | 'neutral' | 'thinking' | 'empathetic' | 'encouraging' | 'listening';

export type FeedbackType = 'positive' | 'neutral' | 'negative';

interface UseRioExpressionReturn {
  getExpressionFromFeedback: (feedbackType: FeedbackType) => RioExpression;
  getExpressionFromQuestion: (questionId: string, answerValue?: string) => RioExpression;
}

// Maps answer values to feedback types based on clinical implications
const answerFeedbackMap: Record<string, Record<string, FeedbackType>> = {
  smoking: {
    'no': 'positive',
    'less-10': 'neutral',
    '10-plus': 'negative',
  },
  diabetes: {
    'no': 'positive',
    'controlled': 'neutral',
    'uncontrolled': 'negative',
  },
  bruxism: {
    'no': 'positive',
    'unsure': 'neutral',
    'yes': 'negative',
  },
  gumBleeding: {
    'never': 'positive',
    'sometimes': 'neutral',
    'frequently': 'negative',
  },
  oralHygiene: {
    'twice-plus': 'positive',
    'once': 'neutral',
    'less-once': 'negative',
  },
  implantHistory: {
    'no': 'neutral',
    'success': 'positive',
    'failed': 'negative',
  },
  fractures: {
    'no': 'positive',
    'once': 'neutral',
    'multiple': 'negative',
  },
  alcohol: {
    'no': 'positive',
    'yes': 'negative',
  },
};

export const useRioExpression = (): UseRioExpressionReturn => {
  const getExpressionFromFeedback = useMemo(() => {
    return (feedbackType: FeedbackType): RioExpression => {
      switch (feedbackType) {
        case 'positive':
          return 'smile';
        case 'neutral':
          return 'encouraging';
        case 'negative':
          return 'empathetic'; // Never alarming, always supportive
        default:
          return 'neutral';
      }
    };
  }, []);

  const getExpressionFromQuestion = useMemo(() => {
    return (questionId: string, answerValue?: string): RioExpression => {
      if (!answerValue) {
        return 'listening'; // Waiting for answer
      }

      const questionMap = answerFeedbackMap[questionId];
      if (questionMap && questionMap[answerValue]) {
        return getExpressionFromFeedback(questionMap[answerValue]);
      }

      return 'encouraging'; // Default supportive expression
    };
  }, [getExpressionFromFeedback]);

  return {
    getExpressionFromFeedback,
    getExpressionFromQuestion,
  };
};

// Utility function to get feedback type from question and answer
export const getFeedbackTypeFromAnswer = (questionId: string, answerValue: string): FeedbackType => {
  const questionMap = answerFeedbackMap[questionId];
  if (questionMap && questionMap[answerValue]) {
    return questionMap[answerValue];
  }
  return 'neutral';
};
