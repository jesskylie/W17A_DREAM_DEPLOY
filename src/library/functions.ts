// a file in which to store functions which
// are called regularly throughout the application
import request from 'sync-request-curl';
import httpError from 'http-errors';

import {
  CONVERT_MSECS_TO_SECS,
  RANDOM_COLOURS_ARRAY,
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
} from './constants';

// import libraries
// import fs from 'fs';
import * as fs from 'fs';

// constants used throughout this file

const DATASTORE_FILENAME = 'database.json';

// import types from src/dataStore

import { Action, DataStore, State } from '../dataStore';

interface getDataReturnObject {
  result: boolean;
  data: DataStore | Record<string, never>;
}

/**
 * get data with type DataStore from src/database.json
 *
 * @param {array} dataStore - type DataStore
 *
 * @returns {{nothing: array}} - an empty object
 */
export const saveDataInFile = (dataStore: DataStore): Record<string, never> => {
  fs.writeFileSync(DATASTORE_FILENAME, JSON.stringify(dataStore));

  return {};
};

/**
 * get data with type DataStore from src/database.json
 * first checks if the file DATASTORE_FILENAME exists
 *
 * @param {}
 *
 * @returns {{returnObj: array}} - type getDataReturnObject
 * an object consisting of the result of the function
 * {
 *   result: boolean:
 *     true if the file DATASTORE_FILENAME exists,
 *     false if not
 *   data:
 *     if the file exists: the data from the file DATASTORE_FILENAME
 *     if the file does not exist: an empty object
 * }
 */
const getDataFromFile = (): getDataReturnObject => {
  // inspiration for checking if file exists taken from
  // https://byby.dev/node-check-if-file-exists
  if (fs.existsSync(DATASTORE_FILENAME)) {
    const jsonString = fs.readFileSync(DATASTORE_FILENAME);
    const data: DataStore = JSON.parse(String(jsonString));

    const returnObj = {
      result: true,
      data: data,
    };

    return returnObj;
  }

  const returnObj = {
    result: false,
    data: {},
  };

  return returnObj;
};

/**
 * Iteration 2 - new data retrieval system
 * Retrives data from local file
 * Uses getDataFromFile() imported from './functions.ts'
 * @param - nil
 * @returns {array} type DataStore
 */
export function retrieveDataFromFile(): DataStore {
  const dataStoreObj = getDataFromFile();

  let data: DataStore;

  if (!dataStoreObj.result) {
    data = { users: [], quizzes: [], trash: [], quizzesCopy: [], };
  } else {
    data = dataStoreObj.data as DataStore;
  }

  return data;
}

/**
 * Iteration 2 function
 * Function to test whether token is valid
 * Used in:
 * adminQuizCreate()
 * adminQuizInfo()
 * adminQuizRemove()
 *
 * @param {object} data - the dataStore object
 * @param {number} token - the id of the person creating the quiz
 * ...
 *
 * @returns {boolean} - true if token is valid / false if token is not valid
 */
export function isTokenValid(data: DataStore, token: string): boolean {
  // 1. test for token is type string or length less than 1
  if (!(typeof token === 'string') || token.length < 1) {
    return false;
  }

  // 2. test that token exists in dataStore
  // if the token is found while iterating
  // over the array, the token is pushed
  // to userIdArr[]
  // If at the end of the iteration, the
  // length of userIdArr[] is exactly 1
  // then: the token exists and only
  // one copy of token exists and the boolean
  // true is returned
  // If userIdArr[].length is not exactly 1
  // then either it does not exist, or more than
  // one copy exists, and the boolean false is returned

  const usersArr = data.users;
  const tokenArr = [];

  for (const arr of usersArr) {
    if (arr.token.includes(token)) {
      tokenArr.push(token);
    }
  }

  // not testing for type equality here
  // as during testing tokenArray.length does not return true
  // for type number
  if (tokenArr.length === 1) {
    return true;
  }

  return false;
}

/**
 * Function that returns authUserId using token
 * Used in:
 * adminQuizCreate()
 *
 * @param {object} data - the dataStore object
 * @param {number} token - the token of the logged in user
 * ...
 *
 * @returns {array} - authUserId : number
 */

export interface AuthUserIdFromToken {
  authUserId: number;
}
export function getAuthUserIdUsingToken(
  data: DataStore,
  token: string
): AuthUserIdFromToken {
  const usersArr = data.users;

  let authUserId;
  for (const arr of usersArr) {
    if (arr.token.includes(token)) {
      authUserId = arr.authUserId;
    }
  }
  return { authUserId };
}

/**
 * Function that returns current datetime stamp
 * expressed in seconds
 *
 * @param  - nil
 * ...
 *
 * @returns {number} - current timestamp in seconds
 */
export function createCurrentTimeStamp(): number {
  return Math.floor(Date.now() / CONVERT_MSECS_TO_SECS);
}

/**
 * Function that returns the total number
 * of questions on file as a number
 *
 * @param  - {object} - data: DataStore
 * ...
 *
 * @returns {number} - total number of questions
 */
export function countAllQuestions(data: DataStore): number {
  const quizArr = data.quizzes;

  let numQuestions = 0;

  for (const quiz of quizArr) {
    numQuestions += quiz.questions.length;
  }
  return numQuestions;
}

/**
 * Function that returns the total number
 * of answers on file as a number
 *
 * @param  - {object} - data: DataStore
 * ...
 *
 * @returns {number} - total number of answers
 */
export function countAllAnswers(data: DataStore): number {
  const quizArr = data.quizzes;

  let numAnswers = 0;

  for (const quiz of quizArr) {
    const questArr = quiz.questions;
    for (const questn of questArr) {
      numAnswers += questn.answers.length;
    }
  }
  return numAnswers;
}

/**
 * Function to generate random number
 * from 0 to max - 1
 * eg:
 *   console.log(getRandomInt(3));
 * Expected output: 0, 1 or 2
 * Used in:
 * createQuizQuestion()
 * From:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 *
 * @param {number} max - the max number
 * ...
 *
 * @returns {number} - the random number generated
 * between 0 and up to but not including max
 */
export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/**
 * Function to return a random colour
 * from an array of colours
 *
 * @param {array} array of colours: RANDOM_COLOURS_ARRAY
 * ...
 *
 * @returns {string} - the randomly selected colour
 */
export function returnRandomColour(): string {
  const randomNumber = getRandomInt(RANDOM_COLOURS_ARRAY.length);
  return RANDOM_COLOURS_ARRAY[randomNumber];
}

// export function getRandomInteger(): number {
//   return Math.random() * (ONE_MILLION - 0);
// }

export function getState(data: DataStore, sessionId: number): State {
  for (const check of data.quizzesCopy) {
    if (check.session.sessionId === sessionId) {
      return check.session.state;
    }
  }
}

// checks if quiz is in end state
export function isQuizInEndState(data: DataStore, quizId: number): boolean {
  for (const check of data.quizzesCopy) {
    if (check.metadata.quizId === quizId) {
      if (check.session.state !== State.END) {
        return false;
      }
    }
  }
  return true;
}

export function isActionValid(state: State, action: Action) {
  if (state === State.LOBBY) {
    if (action === Action.END || action === Action.NEXT_QUESTION) {
      return true;
    } else {
      return false;
    }
  }
  if (state === State.QUESTION_COUNTDOWN) {
    if (action === Action.SKIP_COUNTDOWN || action === Action.END) {
      return true;
    } else {
      return false;
    }
  }
  if (state === State.QUESTION_OPEN) {
    if (action === Action.END || action === Action.GO_TO_ANSWER) {
      return true;
    } else {
      return false;
    }
  }
  if (state === State.QUESTION_CLOSE) {
    if (
      action === Action.END ||
      action === Action.GO_TO_ANSWER ||
      action === Action.GO_TO_FINAL_RESULTS
    ) {
      return true;
    } else {
      return false;
    }
  }
  if (state === State.ANSWER_SHOW) {
    if (
      action === Action.END ||
      action === Action.NEXT_QUESTION ||
      action === Action.GO_TO_FINAL_RESULTS
    ) {
      return true;
    } else {
      return false;
    }
  }
  if (state === State.FINAL_RESULTS) {
    if (action === Action.END) {
      return true;
    } else {
      return false;
    }
  }
  if (state === State.END) {
    return false;
  }
}

/**
 * Function to check the validity of a thumbnailUrl
 *
 * @param {string} thumbnailUrl - the string of the url to be checked
 * ...
 *
 * @returns {{void}} - nothing
 * throws an error if an error is detected
 * ...
 * called by:
 *
 * isThumbnailUrlValid(thumbnailUrlString)
 *
 */

export const isThumbnailUrlValid = (thumbnailUrl: string): void => {
  // Error Check 1: The thumbnailUrl is an empty string

  if (thumbnailUrl.length === 0) {
    throw httpError(RESPONSE_ERROR_400, 'The thumbnailUrl is an empty string');
  }

  // Error Check 2: The thumbnailUrl does not return to a valid file

  const response = request('GET', thumbnailUrl);

  const testStatusCode = response.statusCode;

  if (testStatusCode !== RESPONSE_OK_200) {
    throw httpError(
      RESPONSE_ERROR_400,
      'The thumbnailUrl does not return to a valid file'
    );
  }

  // Error Check 3: The thumbnailUrl, when fetched, is not a JPG or PNG file type

  const contentType = response.headers['content-type'];

  if (contentType !== 'image/jpeg' && contentType !== 'image/png') {
    throw httpError(
      RESPONSE_ERROR_400,
      'The thumbnailUrl, when fetched, is not a JPG or PNG file type'
    );
  }
};
