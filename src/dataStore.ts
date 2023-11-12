// YOU SHOULD MODIFY THIS OBJECT BELOW
// let data = {
//   users: [
//     {
//       authUserId: 1,
//       nameFirst: 'Saarthak',
//       nameLast: 'Sinha',
//       email: 'saarthak@gmail.com',
//       password: 'Password123456',
//       numSuccessfulLogins: 2,
//       numFailedPasswordsSinceLastLogin: 0,
//       quizId: [1],
//     },
//     {
//       authUserId: 2,
//       nameFirst: 'Belinda',
//       nameLast: 'Wong',
//       email: 'belinda@gmail.com',
//       password: 'TestPass1234',
//       numSuccessfulLogins: 1,
//       numFailedPasswordsSinceLastLogin: 3,
//       quizId: [1, 2],
//     },
//     {
//       authUserId: 3,
//       nameFirst: 'Jessica',
//       nameLast: 'Tran',
//       email: 'jessica@gmail.com',
//       password: 'CheckNow1234',
//       numSuccessfulLogins: 4,
//       numFailedPasswordsSinceLastLogin: 2,
//       quizId: [],
//     },
//   ],
//   quizzes: [
//     {
//       quizId: 1,
//       name: 'quiz1',
//       description:
//         'A quiz about the extra curricular activities available at UNSW',
//       timeCreated: 1655577887,
//       timeLastEdited: 1884723824,
//       userId: [1, 2],
//     },
//     {
//       quizId: 2,
//       name: 'quiz2',
//       description: 'A quiz about the food and drink options available at UNSW',
//       timeCreated: 1655577887,
//       timeLastEdited: 1884723824,
//       userId: [2],
//     },
//   ],
// };

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// TypeScript interfaces for Iteration 2 - START

export interface ResultForEachQuestion {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface Player {
  playerId: number;
  name: string;
  selectedAnswer: number[][];
  timeAnswered?: number;
}

export interface Message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

export interface Session {
  sessionId: number;
  state: State;
  autoStartNum: number;
  players: Player[];
  result: ResultForEachQuestion[];
  atQuestion: number;
  numQuestions: number;
  messages: Message[];
  timer: boolean
}

export interface QuizzesCopy {
  session: Session;
  metadata: Quizzes;
}

export interface Users {
  authUserId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  oldPasswords: string[];
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  quizId: number[];
  token: string[];
}

export interface Question {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  questionStartTime?: number;
  answers: {
    answerId: number;
    answer: string;
    colour: string;
    correct: boolean;
  }[];
}

export enum State {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}

export enum Action {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END',
}

export interface Quizzes {
  quizId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  userId: number[];
  numQuestions: number;
  questions: Question[];
  duration: number;
  thumbnailUrl: string;
}

export interface DataStore {
  users: Users[];
  quizzes: Quizzes[];
  trash: Quizzes[];
  quizzesCopy: QuizzesCopy[];
}

export let data: DataStore = {
  users: [],
  quizzes: [],
  trash: [],
  quizzesCopy: [],
};

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore) {
  data = newData;
}

export { getData, setData };

// TypeScript interfaces for Iteration 2 - END
