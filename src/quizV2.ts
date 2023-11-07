import HTTPError from 'http-errors';
import { DataStore, State } from './dataStore';
import {
  retrieveDataFromFile,
  saveDataInFile,
  isTokenValid,
  getAuthUserIdUsingToken,
  createCurrentTimeStamp,
  getRandomInt,
  getState,
} from './library/functions';

import {
  MAX_DESCRIPTION_LENGTH,
  ONE_MILLION,
} from './library/constants';

import {
  isQuizNameValid,
  isQuizIdInTrash,
  isQuizIdValid,
  pushNewQuizIdToUserArray,
  isAuthUserIdMatchQuizId,
  QuizInfoReturn,
  QuizId,
  ErrorObjectWithCode,
} from './quiz';

/**
 * Refactored for Iteration 3
 * Creates a new quiz for the logged in user, returning an object containing
 * a unique quizId
 * @param {string} token - the token of the person creating the quiz - must exist / be valid / be unique
 * @param {string} name - name of the quiz being created
 * @param {string} description - description of the quiz being created
 * @returns {{array}} - if an error occurs, an array of an
 * error object containing an error message, and
 * an errorCode object with error codes 400 or 401
 * @returns {{quizId: number}} - an object with the key quizId and the value the, unique, quizId
 */
export function adminQuizCreateV2(
  token: string,
  name: string,
  description: string
): QuizId | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();
  const isTokenValidTest = isTokenValid(data, token);

  if (!isTokenValidTest) {
    throw HTTPError(401, 'Token is empty or invalid');
  }

  // checks valid authUserId
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isQuizNameValidTest = isQuizNameValid(
    data,
    name,
    authUserId.authUserId
  );

  if (!isQuizNameValidTest.result) {
    throw HTTPError(400, 'Quiz name is invalid');
  }

  // description is not more than 100 characters in length - error 400
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw HTTPError(400, 'Description is more than 100 characters in length');
  }

  // determine new quizId
  // Inspiration taken from adminAuthRegister() in auth.js
  let newQuizId = getRandomInt(ONE_MILLION);
  while (isQuizIdInTrash(data, newQuizId) || isQuizIdValid(data, newQuizId)) {
    newQuizId = getRandomInt(ONE_MILLION);
  }

  data.quizzes.push({
    quizId: newQuizId,
    name,
    description,
    timeCreated: createCurrentTimeStamp(),
    timeLastEdited: createCurrentTimeStamp(),
    userId: [authUserId.authUserId],
    questions: [],
    numQuestions: 0,
    duration: 0,
    state: State.LOBBY,
  });

  // Add quizId to quizId[] array in data.users
  pushNewQuizIdToUserArray(data, authUserId.authUserId, newQuizId);
  saveDataInFile(data);

  return {
    quizId: newQuizId,
  };
}

/**
 * Adapted for iteration 3
 * Given a particular quiz, permanently remove the quiz.
 * @param {string} token - the token of the person want to print quizzes - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz want to be delete - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object if an error occurs
 * @returns {} - return nothing
 */
export function adminQuizRemoveV2(
  token: string,
  quizId: number
): Record<string, never> | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isTokenValidTest = isTokenValid(data, token);
  const isAuthUserIdMatchQuizIdTest = isAuthUserIdMatchQuizId(
    data,
    authUserId.authUserId,
    quizId
  );
  if (!isAuthUserIdMatchQuizIdTest && isTokenValidTest && isQuizIdValidTest) {
    throw HTTPError(403, 'QuizId does not match authUserId');
  }
  if (!token) {
    throw HTTPError(401, 'Token is empty');
  }
  if (!isTokenValidTest) {
    throw HTTPError(401, 'Token is invalid');
  }

  // All sessions for this quiz must be in end state
  const state = getState();
  if (!state.has(State.END)) {
    throw HTTPError(400, 'All sessions for this quiz must be in END State');
  }

  const newdata = data;
  const userToUpdata = data.users.find(
    (user) => user.authUserId === authUserId.authUserId
  );
  const quizToTrash = data.quizzes.filter((quiz) => quiz.quizId === quizId);
  data.quizzes = data.quizzes.filter((quiz) => quiz.quizId !== quizId);
  if (userToUpdata) {
    const indexToRemove = userToUpdata.quizId.indexOf(quizId);
    if (indexToRemove !== -1) {
      userToUpdata.quizId.splice(indexToRemove, 1);
    }
  }
  for (let check of newdata.users) {
    if (check.authUserId === authUserId.authUserId) {
      check = userToUpdata;
    }
  }
  newdata.trash.push(quizToTrash[0]);
  saveDataInFile(newdata);
  return {};
}

/**
 * Printing out the the quiz information - adapted for iteration 3 to throw HTTP errors
 *
 * @param {string} token - the token of the person want to print quiz - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz being print - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object with error code if an error occurs
 * @returns {{quizInfo}} - an object with all the quiz informations
 */
export function adminQuizInfoV2(token: string, quizId: number): QuizInfoReturn | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isTokenValidTest = isTokenValid(data, token);
  const isAuthUserIdMatchQuizIdTest = isAuthUserIdMatchQuizId(
    data,
    authUserId.authUserId,
    quizId
  );

  if (!isAuthUserIdMatchQuizIdTest && isTokenValidTest && isQuizIdValidTest) {
    throw HTTPError(403, 'QuizId does not match authUserId');
  }
  if (!token) {
    throw HTTPError(401, 'Token is empty');
  }
  if (!isTokenValidTest) {
    throw HTTPError(401, 'Token is invalid');
  }
  if (!isQuizIdValidTest) {
    throw HTTPError(400, 'Quiz is invalid');
  }

  for (const check of data.quizzes) {
    if (check.quizId === quizId) {
      let duration = 0;
      for (const count of check.questions) {
        duration += count.duration;
      }
      return {
        quizId: check.quizId,
        name: check.name,
        timeCreated: check.timeCreated,
        timeLastEdited: check.timeLastEdited,
        description: check.description,
        numQuestions: check.numQuestions,
        questions: check.questions,
        duration: duration,
      };
    }
  }
}
