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

interface ResultForEachQuestion {
  questionId: number,
  playersCorrectList: string[],
  averageAnswerTime : number,
  percentCorrect: number
}

interface Player {
  playerId: number;
  name: string;
}

interface session {
  sessionIds: number;
  state: State;
  autoStartNum: number;
  players: Player[];
  result: ResultForEachQuestion[];
  atQuestion: number;
  numQuestions: number;
}

interface QuizzesCopy {
  sessions: session[];
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
  answers: {
    answerId: number;
    answer: string;
    colour: string;
    correct: boolean;
  }[];
}

export enum State {
  LOBBY = 'lobby',
  QUESTION_COUNTDOWN = 'question_countdown',
  QUESTION_OPEN = 'question_open',
  QUESTION_CLOSE = 'question_close',
  ANSWER_SHOW = 'answer_show',
  FINAL_RESULTS = 'final results',
  END = 'end',
}

export enum Action {
  NEXT_QUESTION = 'next_question',
  SKIP_COUNTDOWN = 'skip_countdown',
  GO_TO_ANSWER = 'go_to_answer',
  GO_TO_FINAL_RESULTS = 'go_to_final_results',
  END = 'end',
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
