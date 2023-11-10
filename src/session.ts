import httpError, { HttpError } from 'http-errors';
import {
  Action,
  DataStore,
  Message,
  Player,
  Quizzes,
  ResultForEachQuestion,
  State,
} from './dataStore';
import { ONE_MILLION } from './library/constants';
import { getRandomInt, getState, isActionValid, retrieveDataFromFile, saveDataInFile } from './library/functions';
import { MessageBody } from './library/interfaces';
import {
  isQuizIdValid,
  isAuthUserIdMatchQuizId,
  SessionId,
} from './quiz';
import { isTokenValid, getAuthUserIdUsingToken } from './library/functions';

const MAX_AUTO_START_NUM = 50;
const MAX_END_STATE_NUM = 10;

export const viewAllSessions = (token: string, quizId: number) => {
  const data = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isTokenValidTest = isTokenValid(data, token);
  const isAuthUserIdMatchQuizIdTest = isAuthUserIdMatchQuizId(
    data,
    authUserId.authUserId,
    quizId
  );
  // Valid token is provided, but user does not own quiz - error 403
  if (!isAuthUserIdMatchQuizIdTest && isTokenValidTest && isQuizIdValidTest) {
    throw httpError(403, 'QuizId does not match authUserId');
  }
  // Token is empty or invalid - error 401
  if (!isTokenValidTest) {
    throw httpError(401, 'Token is empty or invalid');
  }
  const activeSessions = [];
  const inactiveSessions = [];
  for (const check of data.quizzesCopy) {
    if (check.metadata.quizId === quizId) {
      if (check.session.state === State.END) {
        inactiveSessions.push(check.session.sessionId);
      } else {
        activeSessions.push(check.session.sessionId);
      }
    }
  }
  return {
    activeSessions: activeSessions,
    inactiveSessions: inactiveSessions
  };
};

export const startNewSession = (quizId: number, token: string, autoStartNum: number): SessionId | HttpError => {
  const data = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isTokenValidTest = isTokenValid(data, token);
  const isAuthUserIdMatchQuizIdTest = isAuthUserIdMatchQuizId(
    data,
    authUserId.authUserId,
    quizId
  );
  // Valid token is provided, but user does not own quiz - error 403
  if (!isAuthUserIdMatchQuizIdTest && isTokenValidTest && isQuizIdValidTest) {
    throw httpError(403, 'QuizId does not match authUserId');
  }
  // Token is empty or invalid - error 401
  if (!isTokenValidTest) {
    throw httpError(401, 'Token is empty or invalid');
  }

  // autoStartNum is a number greater than 50 - 400 error
  if (autoStartNum > MAX_AUTO_START_NUM) {
    throw httpError(400, 'autoStartNum can not be greater than 50');
  }

  // the quiz does not have any questions in it - 400 error
  for (const quizzes of data.quizzes) {
    if (quizzes.quizId === quizId) {
      const num = quizzes.numQuestions;
      if (num === 0) {
        throw httpError(400, 'The quiz does not have any questions in it');
      }
    }
  }

  // maximum of 10 sessions that are not in END state currently exist - error 400
  if (countQuizNotInEndState(data, quizId) >= MAX_END_STATE_NUM) {
    throw httpError(400, 'A maximum of 10 sessions that are not in END state currently exist');
  }

  // copy quiz of current quizid
  const copyQuiz: Quizzes = {
    quizId: 0,
    name: '',
    description: '',
    timeCreated: 0,
    timeLastEdited: 0,
    userId: [],
    numQuestions: 0,
    questions: [],
    duration: 0,
    thumbnailUrl: '',
  };
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      copyQuiz.description = quiz.description;
      copyQuiz.duration = quiz.duration;
      copyQuiz.name = quiz.name;
      copyQuiz.numQuestions = quiz.numQuestions;
      copyQuiz.quizId = quiz.quizId;
      copyQuiz.timeCreated = quiz.timeCreated;
      copyQuiz.timeLastEdited = quiz.timeLastEdited;
      copyQuiz.userId = quiz.userId;
      copyQuiz.thumbnailUrl = quiz.thumbnailUrl;
    }
  }
  // randomly generates sessionId number
  let sessionId = getRandomInt(ONE_MILLION);

  while (isSessionIdRepeated(data, sessionId)) {
    sessionId = getRandomInt(ONE_MILLION);
  }

  // create session interface
  const session = {
    sessionId: sessionId,
    state: State.LOBBY,
    autoStartNum: autoStartNum,
    players: [] as Player[],
    result: [] as ResultForEachQuestion[],
    atQuestion: 0,
    numQuestions: copyQuiz.numQuestions,
    messages: [] as Message[],
  };
  // pushes quizCopyObject to data.quizzesCopy interface
  const quizCopyObject = {
    session: session,
    metadata: copyQuiz,
  };
  data.quizzesCopy.push(quizCopyObject); // unable to push since data.quizzesCopy is undefined
  saveDataInFile(data);
  return { sessionId: sessionId };
};

export const updateSessionState = (quizId: number, sessionId: number, token: string, action: Action) => {
  const data = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isTokenValidTest = isTokenValid(data, token);
  const isAuthUserIdMatchQuizIdTest = isAuthUserIdMatchQuizId(
    data,
    authUserId.authUserId,
    quizId
  );
  // Valid token is provided, but user does not own quiz - error 403
  if (!isAuthUserIdMatchQuizIdTest && isTokenValidTest && isQuizIdValidTest) {
    throw httpError(403, 'QuizId does not match authUserId');
  }
  // Token is empty or invalid - error 401
  if (!isTokenValidTest) {
    throw httpError(401, 'Token is empty or invalid');
  }

  // the quiz does not have any questions in it - 400 error
  for (const quizzes of data.quizzes) {
    if (quizzes.quizId === quizId) {
      const num = quizzes.numQuestions;
      if (num === 0) {
        throw httpError(400, 'The quiz does not have any questions in it');
      }
    }
  }

  // Invalid SessionId - error 400
  if (!isSessionIdValid(data, quizId, sessionId)) {
    throw httpError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  // maximum of 10 sessions that are not in END state currently exist - error 400
  if (countQuizNotInEndState(data, quizId) >= MAX_END_STATE_NUM) {
    throw httpError(400, 'A maximum of 10 sessions that are not in END state currently exist');
  }

  let state = getState(data, sessionId);
  if (!isActionValid(state, action)) {
    throw httpError(400, 'Action enum cannot be applied in the current state (see spec for details)');
  }
  if (action !== Action.END && action !== Action.GO_TO_ANSWER && action !== Action.GO_TO_FINAL_RESULTS &&
    action !== Action.NEXT_QUESTION && action !== Action.SKIP_COUNTDOWN) {
    throw httpError(400, 'Action provided is not a valid Action enum');
  }
  if (state === State.LOBBY && action === Action.END) {
    state = State.END;
  }
  if (state === State.LOBBY && action === Action.NEXT_QUESTION) {
    state = State.QUESTION_COUNTDOWN;
  }
  if (state === State.QUESTION_COUNTDOWN && action === Action.END) {
    state = State.END;
  }
  if (state === State.QUESTION_COUNTDOWN && action === Action.SKIP_COUNTDOWN) {
    state = State.QUESTION_OPEN;
  }
  if (state === State.QUESTION_OPEN && action === Action.END) {
    state = State.END;
  }
  if (state === State.QUESTION_OPEN && action === Action.GO_TO_ANSWER) {
    state = State.ANSWER_SHOW;
  }
  if (state === State.QUESTION_CLOSE && action === Action.END) {
    state = State.END;
  }
  if (state === State.QUESTION_CLOSE && action === Action.NEXT_QUESTION) {
    state = State.QUESTION_COUNTDOWN;
  }
  if (state === State.QUESTION_CLOSE && action === Action.GO_TO_ANSWER) {
    state = State.ANSWER_SHOW;
  }
  if (state === State.ANSWER_SHOW && action === Action.NEXT_QUESTION) {
    state = State.QUESTION_COUNTDOWN;
  }
  if (state === State.ANSWER_SHOW && action === Action.GO_TO_FINAL_RESULTS) {
    state = State.FINAL_RESULTS;
  }
  if (state === State.ANSWER_SHOW && action === Action.END) {
    state = State.END;
  }
  if (state === State.FINAL_RESULTS && action === Action.END) {
    state = State.END;
  }

  const newdata = data;
  for (const check of newdata.quizzesCopy) {
    if (check.session.sessionId === sessionId) {
      check.session.state = state;
    }
  }
  saveDataInFile(newdata);
  return {};
};

export const getSeesionStatus = (quizId: number, sessionId: number, token: string) => {
  return {
    state: 'LOBBY',
    atQuestion: 3,
    players: [
      'Hayden'
    ],
    metadata: {
      quizId: 5546,
      name: 'This is the name of the quiz',
      timeCreated: 1683019484,
      timeLastEdited: 1683019484,
      description: 'This quiz is so we can have a lot of fun',
      numQuestions: 1,
      questions: [
        {
          questionId: 5546,
          question: 'Who is the Monarch of England?',
          duration: 4,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 5,
          answers: [
            {
              answerId: 2384,
              answer: 'Prince Charles',
              colour: 'red',
              correct: true
            }
          ]
        }
      ],
      duration: 44,
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    }
  };
};

export const getQuizFinalResult = (quizId: number, sessionId: number, token: string) => {
  return {
    usersRankedByScore: [
      {
        name: 'Hayden',
        score: 45
      }
    ],
    questionResults: [
      {
        questionId: 5546,
        playersCorrectList: [
          'Hayden'
        ],
        averageAnswerTime: 45,
        percentCorrect: 54
      }
    ]
  };
};

export const getQuizFinalResultCSV = (quizId: number, sessionId: number, token: string) => {
  return {
    url: 'http://google.com/some/image/path.csv'
  };
};

export const playerJoinSession = (sessionId: number, name: string) => {
  return {
    playerId: 0
  };
};

export const playerStatus = (playerId: number) => {
  return {
    state: 'LOBBY',
    numQuestions: 1,
    atQuestion: 3
  };
};

export const playerCurrentQuestionInfo = (playerId: number, questionposition: number) => {
  return {
    questionId: 5546,
    question: 'Who is the Monarch of England?',
    duration: 4,
    thumbnailUrl: 'http://google.com/some/image/path.jpg',
    points: 5,
    answers: [
      {
        answerId: 2384,
        answer: 'Prince Charles',
        colour: 'red'
      }
    ]
  };
};

export const playerSubmit = (playerId: number, questionposition: number, answerId: number[]) => {
  return {};
};

export const questionResult = (playerId: number, questionposition: number) => {
  return {
    questionId: 5546,
    playersCorrectList: [
      'Hayden'
    ],
    averageAnswerTime: 45,
    percentCorrect: 54
  };
};

export const sessionFinalResult = (playerId: number) => {
  return {
    usersRankedByScore: [
      {
        name: 'Hayden',
        score: 45
      }
    ],
    questionResults: [
      {
        questionId: 5546,
        playersCorrectList: [
          'Hayden'
        ],
        averageAnswerTime: 45,
        percentCorrect: 54
      }
    ]
  };
};

export const getAllChatMessage = (playerId: number) => {
  return {
    messages: [
      {
        messageBody: 'This is a message body',
        playerId: 5546,
        playerName: 'Yuchao Jiang',
        timeSent: 1683019484
      }
    ]
  };
};

export const sendChatMessage = (message: MessageBody, playerId: number) => {
  return {};
};

const isSessionIdRepeated = (data: DataStore, sessionId: number): boolean => {
  const sessionIdArr = data.quizzesCopy;
  for (const check of sessionIdArr) {
    if (check.session.sessionId === sessionId) {
      return true;
    }
  }
  return false;
};

// finds all quizzes in QuizzesCopy with specific quizIds
// returns the count of quizzes in end state
function countQuizNotInEndState(data: DataStore, quizId: number): number {
  let count = 0;
  if (data.quizzesCopy.length >= MAX_END_STATE_NUM) {
    for (const quizzesCopy of data.quizzesCopy) {
      if (quizzesCopy.metadata.quizId === quizId) {
        if (quizzesCopy.session.state !== State.END) {
          count++;
        }
      }
    }
  }
  return count;
}

function isSessionIdValid(data: DataStore, quizId: number, sessionId: number): boolean {
  for (const check of data.quizzesCopy) {
    if (check.metadata.quizId === quizId) {
      if (check.session.sessionId === sessionId) {
        return true;
      }
    }
  }
  return false;
}
