import httpError, { HttpError } from 'http-errors';
import {
  getRandomInt,
  getState,
  retrieveDataFromFile,
  saveDataInFile,
} from './library/functions';
import { DataStore, State } from './dataStore';
import { ONE_MILLION, RESPONSE_ERROR_400 } from './library/constants';

export interface PlayerId {
  playerId: number;
}

export const playerCreate = (
  sessionId: number,
  name: string
): PlayerId | HttpError => {
  const data = retrieveDataFromFile();
  if (!isSessionIdValid(data, sessionId)) {
    throw httpError(RESPONSE_ERROR_400, 'SessionId is invalid');
  }

  if (getState(data, sessionId) !== State.LOBBY) {
    throw httpError(RESPONSE_ERROR_400, 'Session is not in LOBBY state');
  }

  if (name === '') {
    name = generateRandomName();
    while (isPlayerNameRepeated(data, name)) {
      name = generateRandomName();
    }
  }

  if (isPlayerNameRepeated(data, name)) {
    throw httpError(RESPONSE_ERROR_400, 'Name of user entered is not unique');
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

      // checks if this player that has joined will start the session
      const numPlayers = check.session.players;
      if (numPlayers.length === check.session.autoStartNum) {
        const currQuizQuestion = check.metadata.questions[0];
        currQuizQuestion.questionStartTime = Date.now();
      }
    }
  }
  saveDataInFile(newdata);
  return { playerId: playerId };
};

interface PlayerQuestionInformationObj {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: {
    answerId: number;
    answer: string;

    colour: string;
  }[];
}

/**
 * Get the information about a question that the guest player is on
 *
 * @param {playerId} number - the playerId of the person for whom the information about the quiz is sort
 * @param {questionPosition} number - the question number at which the player is
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {{playerQuestionInfoObj}} - an object of information about the player and question
 */
export function getQuestionInformationForPlayer(
  playerId: number,
  questionPosition: number
): PlayerQuestionInformationObj | HttpError {
  const data: DataStore = retrieveDataFromFile();

  console.log('data.quizzesCopy ->', data.quizzesCopy);
  console.log(
    'data.quizzesCopy.metadata.questions ->',
    data.quizzesCopy[0].metadata.questions
  );

  // Step 1: check whether player ID exists - START
  let playerIdExists = false;

  for (const qzCopy of data.quizzesCopy) {
    const sessionObj = qzCopy.session;
    for (const plyArr of sessionObj.players) {
      if (plyArr.playerId === playerId) {
        playerIdExists = true;
      }
    }
  }

  if (!playerIdExists) {
    throw httpError(RESPONSE_ERROR_400, 'If player ID does not exist');
  }

  // Step 1: check whether player ID exists - END

  // Step 2: If question position is not valid for the session this player is in - START
  // let playerIdExists = false;

  // for (const qzCopy of data.quizzesCopy) {
  //   const sessionObj = qzCopy.session;
  //   for (const plyArr of sessionObj.players) {
  //     if (plyArr.playerId === playerId) playerIdExists = true;
  //   }
  // }

  // if (!playerIdExists) {
  //   throw httpError(RESPONSE_ERROR_400, 'Name of user entered is not unique');
  // }

  // Step 2: If question position is not valid for the session this player is in - END

  // Step 3: If session is not currently on this question - START
  let correctSessionObj;
  let correctSessionId;

  for (const qzCopy of data.quizzesCopy) {
    const sessionObj = qzCopy.session;
    for (const plyArr of sessionObj.players) {
      if (plyArr.playerId === playerId) {
        correctSessionObj = sessionObj;
        correctSessionId = sessionObj.sessionId;
      }
    }
  }

  if (correctSessionObj.atQuestion !== questionPosition) {
    throw httpError(
      RESPONSE_ERROR_400,
      'If session is not currently on this question'
    );
  }

  // Step 3: If session is not currently on this question - END

  // Step 4: check whether Session is in LOBBY or END state - START

  const state = getState(data, correctSessionId);

  if (state === State.LOBBY || state === State.END) {
    throw httpError(RESPONSE_ERROR_400, 'Session is in LOBBY or END state');
  }

  // Step 4: check whether Session is in LOBBY or END state - END

  // Now that all error cases have been dealt with
  // return the response

  // get the correct question, using questionposition

  const questionsArr = data.quizzesCopy[0].metadata.questions;

  console.log('questionsArr ->', questionsArr);

  let correctQuestion;

  console.log('questionPosition ->', questionPosition);

  for (const qArr of questionsArr) {
    if (qArr.questionId === questionPosition + 1) {
      correctQuestion = qArr;
    }
  }

  console.log('correctQuestion ->', correctQuestion);

  const returnObj = {
    questionId: correctQuestion.questionId,
    question: correctQuestion.question,
    duration: correctQuestion.duration,
    thumbnailUrl: correctQuestion.thumbnailUrl,
    points: correctQuestion.points,
    answers: correctQuestion.answers,
  };

  return returnObj;
}

// helper function
function isSessionIdValid(data: DataStore, sessionId: number): boolean {
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

function isPlayerNameRepeated(data: DataStore, name: string): boolean {
  for (const check of data.quizzesCopy) {
    for (const checkname of check.session.players) {
      if (checkname.name === name) {
        return true;
      }
    }
  }
  return false;
}

function generateRandomName(): string {
  const allLetters: string[] = Array.from({ length: 26 }, (_, index) =>
    String.fromCharCode(97 + index)
  );
  let randomName = '';
  while (randomName.length < 5) {
    randomName = randomName + allLetters[getRandomInt(allLetters.length)];
  }
  while (randomName.length < 8) {
    randomName = randomName + getRandomInt(9);
  }
  return randomName;
}
