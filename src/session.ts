import httpError, { HttpError } from 'http-errors';
import {
  Action,
  DataStore,
  Message,
  Player,
  Quizzes,
  ResultForEachQuestion,
  Session,
  State,
} from './dataStore';
import { CONVERT_MSECS_TO_SECS, ONE_MILLION } from './library/constants';
import { getRandomInt, getState, isActionValid, retrieveDataFromFile, saveDataInFile } from './library/functions';
import { PlayerId, PlayerStatus, PlayerWithScore, SessionFinalResult, FinalResult } from './library/interfaces';
import { isQuizIdValid, isAuthUserIdMatchQuizId, SessionId } from './quiz';
import { isTokenValid, getAuthUserIdUsingToken } from './library/functions';

const MAX_AUTO_START_NUM = 50;
const MAX_NOT_IN_END_STATE_NUM = 10;

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
    inactiveSessions: inactiveSessions,
  };
};

export const startNewSession = (
  quizId: number,
  token: string,
  autoStartNum: number
): SessionId | HttpError => {
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
  if (countQuizNotInEndState(data, quizId) >= MAX_NOT_IN_END_STATE_NUM) {
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
      copyQuiz.questions = quiz.questions;
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
    timer: true,
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

export const updateSessionState = (
  quizId: number,
  sessionId: number,
  token: string,
  action: Action
) => {
  const data = retrieveDataFromFile();
  let newdata = data;
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
    throw httpError(
      400,
      'Session Id does not refer to a valid session within this quiz'
    );
  }

  // maximum of 10 sessions that are not in END state currently exist - error 400
  if (countQuizNotInEndState(data, quizId) >= MAX_NOT_IN_END_STATE_NUM) {
    throw httpError(400, 'A maximum of 10 sessions that are not in END state currently exist');
  }

  let state = getState(data, sessionId);
  if (!isActionValid(state, action)) {
    throw httpError(
      400,
      'Action enum cannot be applied in the current state (see spec for details)'
    );
  }
  if (
    action !== Action.END &&
    action !== Action.GO_TO_ANSWER &&
    action !== Action.GO_TO_FINAL_RESULTS &&
    action !== Action.NEXT_QUESTION &&
    action !== Action.SKIP_COUNTDOWN
  ) {
    throw httpError(400, 'Action provided is not a valid Action enum');
  }

  // remove the exist timeout promise
  const session = newdata.quizzesCopy.find(
    (session) => session.session.sessionId === sessionId
  );
  if (session.session.timer) {
    session.session.timer = false;
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
    for (const update of newdata.quizzesCopy.find((session) => 
    session.session.sessionId === sessionId).metadata.questions){
      update.questionStartTime = Date.now();
    }
    for (const session of newdata.quizzesCopy) {
      if (session.session.sessionId === sessionId) {
        session.session.atQuestion += 1;
      }
    }
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

  for (const check of newdata.quizzesCopy) {
    if (check.session.sessionId === sessionId) {
      check.session.state = state;
      // state Question_countdown and Quesition_open are the only two need to set
      // timer for auto update
      if (state === State.QUESTION_COUNTDOWN || state === State.QUESTION_OPEN) {
        check.session.timer = true;
      }
    }
  }
  saveDataInFile(newdata);

   // if state is countdown, set a timer for 3 seconds and update to
  // database telling timer exist - timer 
  // this will only exist when state is changing from lobby -> question_countdown
  if (state === State.QUESTION_COUNTDOWN && action === Action.NEXT_QUESTION) {
    setTimer(newdata, sessionId, 3).then(() => {
      newdata = retrieveDataFromFile();
      if (isSessionIdValid(newdata, quizId, sessionId) && newdata.quizzesCopy.find((session) => (session.session.sessionId === sessionId)).session.timer === true) {
        updateStateWithTimer(data, sessionId, State.QUESTION_OPEN);
        newdata = retrieveDataFromFile();
        const currSession = newdata.quizzesCopy.find((session) => session.session.sessionId === sessionId);
        setTimer(newdata, sessionId, currSession.metadata.questions[session.session.atQuestion -1].duration).then(() => {
          newdata = retrieveDataFromFile();
          if (isSessionIdValid(newdata, quizId, sessionId) && newdata.quizzesCopy.find((session) => (session.session.sessionId === sessionId)).session.timer === true) {
            updateStateWithTimer(data, sessionId, State.QUESTION_CLOSE);
          }
        })
      }
    });
  }
  // one more case: when State is from question_countdown to Question_Open
  // and needed to auto change from open to end 
  if (state === State.QUESTION_OPEN && action === Action.SKIP_COUNTDOWN) {
    setTimer(newdata, sessionId, session.metadata.questions[session.session.atQuestion - 1].duration).then(() => {
      newdata = retrieveDataFromFile();
      if (isSessionIdValid(newdata, quizId, sessionId) && newdata.quizzesCopy.find((session) => (session.session.sessionId === sessionId)).session.timer === true) {
        updateStateWithTimer(data, sessionId, State.QUESTION_CLOSE);
      }
    });
  }
  return {};
};

export const getSeesionStatus = (
  quizId: number,
  sessionId: number,
  token: string
) => {
  return {
    state: 'LOBBY',
    atQuestion: 3,
    players: ['Hayden'],
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
              correct: true,
            },
          ],
        },
      ],
      duration: 44,
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    },
  };
};

export const getQuizFinalResult = (
  quizId: number,
  sessionId: number,
  token: string
): FinalResult => {
  const data = retrieveDataFromFile();

  // Token is empty or invalid (does not refer to valid logged in user session) - error 401
  if (!isTokenValid(data, token)) {
    throw httpError(401, 'Token is empty or invalid');
  }

  // 403 error - valid token provided but incorrect user
  const authUserIdString = getAuthUserIdUsingToken(data, token);
  const authUserId = authUserIdString.authUserId;

  // checks if current user id owns current quiz
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      if (!user.quizId.includes(quizId)) {
        throw httpError(403, 'Valid token is provided, but user is unauthorised to complete this action');
      }
    }
  }

  // Session Id does not refer to a valid session within this quiz - error 400
  if (!isSessionIdValid(data, quizId, sessionId)) {
    throw httpError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  // Session is not in FINAL_RESULTS state - error 400
  if (getState(data, sessionId) !== State.FINAL_RESULTS) {
    throw httpError(400, 'Session is not in FINAL_RESULTS state');
  }

  // stores players final scores
  const playerScores: PlayerWithScore[] = [];

  // loops through quizzes copy
  for (const copyQuiz of data.quizzesCopy) {
    if (copyQuiz.session.sessionId === sessionId) {
      // found current sessionid
      const currSessionResult = copyQuiz.session.result;
      // loop through each question in current session
      for (const result of currSessionResult) {
        // loops through players correct array
        for (const playerName of result.playersCorrectList) {
          const playerNamesIndex = playerScores.findIndex(player => player.name === playerName);
          // adds new players to array if it does not exist in playerScores array
          if (playerNamesIndex === -1) {
            playerScores.push({ name: playerName, score: 0 });
          }
          // update player's score
          // finds index of the player name and pushes to that index
          const playersIndex = playerScores.findIndex(player => player.name === playerName);
          const currPoints = checkPointofQuestion(data, result.questionId);
          playerScores[playersIndex].score += currPoints;
        }
      }
    }
  }
  // sort the players by score
  playerScores.sort((a, b) => b.score - a.score);
  const quizIndex = findQuizIndexById(data, quizId);
  return {
    usersRankedByScore: playerScores,
    questionResults: data.quizzesCopy[quizIndex].session.result,
  };
};

// finds current quiz in quizzes copy by its index
function findQuizIndexById(data: DataStore, quizId: number) {
  for (let i = 0; i < data.quizzesCopy.length; i++) {
    if (data.quizzesCopy[i].metadata.quizId === quizId) {
      // return index of copy quiz
      return i;
    }
  }
  // returns -1 if not found
  return -1;
}

export const getQuizFinalResultCSV = (
  quizId: number,
  sessionId: number,
  token: string
) => {
  return {
    url: 'http://google.com/some/image/path.csv',
  };
};

export const playerCreate = (
  sessionId: number,
  name: string
): PlayerId | HttpError => {
  const data = retrieveDataFromFile();
  if (!isSessionIdValidWithoutQuizId(data, sessionId)) {
    throw httpError(400, 'SessionId is invalid');
  }

  if (getState(data, sessionId) !== State.LOBBY) {
    throw httpError(400, 'Session is not in LOBBY state');
  }

  if (name === '') {
    name = generateRandomName();
    while (isPlayerNameRepeated(data, sessionId, name)) {
      name = generateRandomName();
    }
  }

  if (isPlayerNameRepeated(data, sessionId, name)) {
    throw httpError(400, 'Name of user entered is not unique');
  }

  let playerId = getRandomInt(ONE_MILLION);
  while (isPlayerIdRepeated(data, playerId)) {
    playerId = getRandomInt(ONE_MILLION);
  }
  const newPlayer = {
    playerId: playerId,
    name: name,
    selectedAnswer: [[]] as number[][],
  };

  const newdata = data;
  for (const check of newdata.quizzesCopy) {
    if (check.session.sessionId === sessionId) {
      check.session.players.push(newPlayer);
    }
  }
  if (isNumOfPlayerEnoughToLeaveLobby(newdata, sessionId)) {
    for (const check of newdata.quizzesCopy) {
      if (check.session.sessionId === sessionId) {
        updateSessionState(check.metadata.quizId, 
          check.session.sessionId, 
          newdata.users.find((user) => user.authUserId === 
          check.metadata.userId[0]).token[0],
          Action.NEXT_QUESTION);
        
      }
    }
  }
  saveDataInFile(newdata);
  return { playerId: playerId };
};

export const playerStatus = (playerId: number): PlayerStatus => {
  const data = retrieveDataFromFile();
  if (!isPlayerIdRepeated(data, playerId)) {
    throw httpError(400, 'PlayerId does not exist');
  }

  for (const check of data.quizzesCopy) {
    for (const player of check.session.players) {
      if (player.playerId === playerId) {
        const state = check.session.state;
        let atQuestion = 0;
        if (state !== State.LOBBY && state !== State.FINAL_RESULTS && state !== State.END) {
          atQuestion = check.session.atQuestion;
        }
        return {
          state: state,
          numQuestions: check.session.numQuestions,
          atQuestion: atQuestion,
        };
      }
    }
  }
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
        colour: 'red',
      },
    ],
  };
};

export const questionResult = (playerId: number, questionposition: number) => {
  return {
    questionId: 5546,
    playersCorrectList: ['Hayden'],
    averageAnswerTime: 45,
    percentCorrect: 54,
  };
};

export const sessionFinalResult = (playerId: number): SessionFinalResult | HttpError => {
  const data = retrieveDataFromFile();
  if (!isPlayerIdRepeated(data, playerId)) {
    throw httpError(400, 'playerId does not exist');
  }
  for (const check of data.quizzesCopy) {
    for (const player of check.session.players) {
      if (player.playerId === playerId) {
        if (check.session.state !== State.FINAL_RESULTS) {
          throw httpError(400, 'Session is not in FINAL_RESULTS state');
        }
      }
    }
  }

  const playerArray = [];
  for (const session of data.quizzesCopy) {
    for (const player of session.session.players) {
      if (player.playerId === playerId) {
        for (const player of session.session.players) {
          playerArray.push(playerScore(data, session.session, player.name));
        }
      }
    }
  }

  playerArray.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });

  for (const session of data.quizzesCopy) {
    for (const player of session.session.players) {
      if (player.playerId === playerId) {
        return {
          usersRankedByScore: playerArray,
          questionResults: session.session.result
        };
      }
    }
  }
};

// helper function:

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
// returns the count of quizzes NOT in end state
function countQuizNotInEndState(data: DataStore, quizId: number): number {
  let count = 0;
  for (const quizzesCopy of data.quizzesCopy) {
    if (quizzesCopy.metadata.quizId === quizId) {
      if (quizzesCopy.session.state !== State.END) {
        count++;
      }
    }
  }
  return count;
}

function isSessionIdValid(
  data: DataStore,
  quizId: number,
  sessionId: number
): boolean {
  for (const check of data.quizzesCopy) {
    if (check.metadata.quizId === quizId) {
      if (check.session.sessionId === sessionId) {
        return true;
      }
    }
  }
  return false;
}

function isSessionIdValidWithoutQuizId(data: DataStore, sessionId: number): boolean {
  for (const check of data.quizzesCopy) {
    if (check.session.sessionId === sessionId) {
      return true;
    }
  }
  return false;
}

function isPlayerIdRepeated(data: DataStore, playerId: number): boolean {
  for (const check of data.quizzesCopy) {
    for (const player of check.session.players) {
      if (player.playerId === playerId) {
        return true;
      }
    }
  }
  return false;
}

function isPlayerNameRepeated(data: DataStore, sessionId: number, name: string): boolean {
  for (const check of data.quizzesCopy) {
    if (check.session.sessionId === sessionId) {
      for (const checkname of check.session.players) {
        if (checkname.name === name) {
          return true;
        }
      }
    }
  }
  return false;
}

function generateRandomName(): string {
  const allLetters: string[] = Array.from({ length: 26 }, (_, index) => String.fromCharCode(97 + index));
  let randomName = '';
  while (randomName.length < 5) {
    randomName = randomName + allLetters[getRandomInt(allLetters.length)];
  }
  while (randomName.length < 8) {
    randomName = randomName + getRandomInt(9);
  }
  return randomName;
}

function isNumOfPlayerEnoughToLeaveLobby(data: DataStore, sessionId: number): boolean {
  for (const session of data.quizzesCopy) {
    if (session.session.sessionId === sessionId) {
      if (session.session.players.length === session.session.autoStartNum) {
        return true;
      }
    }
  }
  return false;
}

function checkPointofQuestion(data: DataStore, questionId: number): number {
  for (const quiz of data.quizzes) {
    for (const question of quiz.questions) {
      if (question.questionId === questionId) {
        return question.points;
      }
    }
  }
}

function playerScore(data: DataStore, session:Session, playerName: string): PlayerWithScore {
  const playerResult = {
    name: playerName,
    score: 0
  };
  for (const result of session.result) {
    for (const player of result.playersCorrectList) {
      if (playerName === player) {
        playerResult.score += checkPointofQuestion(data, result.questionId);
      }
    }
  }
  return playerResult;
}

function updateStateWithTimer(data: DataStore, sessionId: number, state: State) {
  const newdata = data;
  for (const session of newdata.quizzesCopy) {
    if (session.session.sessionId === sessionId) {
      session.session.state = state;
      if (state === State.QUESTION_OPEN) {
        session.metadata.questions[session.session.atQuestion].questionStartTime = Date.now();
        session.session.atQuestion += 1;
      }
    }
  }
  // console.log('the whole session: ')
  // console.log(newdata.quizzesCopy.find((session)=>session.session.sessionId === sessionId).session);
  // console.log('the whole meetadata: ')
  // console.log(newdata.quizzesCopy.find((session)=>session.session.sessionId === sessionId).metadata);
  return saveDataInFile(newdata);
}

function setTimer(newdata: DataStore, sessionId: number, timeInSecond: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (newdata.quizzesCopy.find((session) => (session.session.sessionId === sessionId)).session.timer === true) {
            resolve();
        } else {
            reject();
        }
    }, timeInSecond * CONVERT_MSECS_TO_SECS);
});
}
