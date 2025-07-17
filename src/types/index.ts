export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  questions?: Question[];
  _count?: {
    questions: number;
  };
}

export interface Question {
  id: string;
  text: string;
  groupId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  group?: Group;
  answers?: Answer[];
  likes?: Like[];
  _count?: {
    likes: number;
    answers: number;
  };
}

export interface Answer {
  id: string;
  text?: string;
  audioUrl?: string;
  questionId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  question?: Question;
  likes?: Like[];
  _count?: {
    likes: number;
  };
}

export interface Like {
  id: string;
  type: 'QUESTION' | 'ANSWER';
  refId: string; // questionId or answerId
  userId: string;
  createdAt: Date;
  user?: User;
}

export interface CreateGroupData {
  name: string;
  description?: string;
}

export interface CreateQuestionData {
  text: string;
  groupId: string;
}

export interface CreateAnswerData {
  text?: string;
  audioUrl?: string;
  questionId: string;
}

export interface SearchParams {
  query?: string;
  groupId?: string;
  sortBy?: 'recent' | 'popular' | 'user';
}

export interface AudioAnswer {
  _id: string;
  questionId: string;
  userId: string;
  fileUrl: string;
  createdAt: Date;
}
