// Question types
export type QuestionType = "email" | "rating" | "text" | "multiple_choice" | "checkbox";
export type PollStatus = "draft" | "active" | "ended";

export interface PollQuestion {
  id: string;
  type: QuestionType;
  question: string;
  required: boolean;
  options?: string[];
}

export interface GeoLocation {
  ip: string;
  country: string;
  city: string;
}

// Custom Poll Types
export interface CustomPoll {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  logoUrl?: string;
  status: PollStatus;
  createdAt: Date;
  questions: CustomPollQuestion[];
  responseCount?: number;
}

export interface CustomPollQuestion {
  id: number;
  pollId: string;
  type: QuestionType;
  question: string;
  questionEn?: string;
  options?: string[];
  optionsEn?: string[];
  required: boolean;
  orderIndex: number;
}

export interface CustomPollResponse {
  id: number;
  pollId: string;
  answers: Record<string, string | number | string[]>;
  ipAddress?: string;
  country?: string;
  city?: string;
  createdAt: Date;
}

// Poll builder form types
export interface PollBuilderQuestion {
  id: string;
  type: QuestionType;
  question: string;
  questionEn: string;
  options: string[];
  optionsEn: string[];
  required: boolean;
}

export interface PollBuilderData {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  questions: PollBuilderQuestion[];
}

// Poll stats
export interface CustomPollStats {
  poll: CustomPoll;
  totalResponses: number;
  totalViews: number;
  questionStats: {
    questionId: number;
    question: string;
    type: QuestionType;
    options?: string[];
    totalResponses: number;
    responses: {
      value: string | number;
      count: number;
    }[];
  }[];
  countryBreakdown: {
    country: string;
    count: number;
  }[];
  recentResponses: {
    id: number;
    answers: Record<string, string | number | string[]>;
    country?: string;
    createdAt: Date;
  }[];
}
