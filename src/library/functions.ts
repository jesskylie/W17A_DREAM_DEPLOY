// a file in which to store functions which
// are called regularly throughout the application
import { CONVERT_MSECS_TO_SECS, RANDOM_COLOURS_ARRAY } from './constants';

// import libraries
// import fs from 'fs';
import * as fs from 'fs';

// constants used throughout this file

const DATASTORE_FILENAME = 'database.json';

// import types from src/dataStore

import { DataStore, State } from '../dataStore';

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
    data = { users: [], quizzes: [], trash: [] };
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

export function getState(): Set<State> {
  const state = new Set<State>();
  if (isQuizInEndState) {
    state.add(State.END);
  }
  return state;
}

// checks if quiz is in end state
function isQuizInEndState(data: DataStore): boolean {
  for (const quiz of data.quizzes) {
    if (quiz.state === State.END) {
      return true;
    }
  }
  return false;
}
