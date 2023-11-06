import isEmail from 'validator/lib/isEmail.js';
import httpError from 'http-errors';
import { DataStore, Question } from './dataStore';
import {
  retrieveDataFromFile,
  saveDataInFile,
  isTokenValid,
  getAuthUserIdUsingToken,
  createCurrentTimeStamp,
  getRandomInt,
} from './library/functions';

import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  MIN_QUIZ_NAME_LENGTH,
  MAX_QUIZ_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  CONVERT_MSECS_TO_SECS,
  ONE_MILLION,
} from './library/constants';

import { AuthUserId } from './library/interfaces';

// TypeScript interfacts - START

interface QuizId {
  quizId: number;
}

export interface ErrorObjectWithCode {
  error: string;
  errorCode: number;
}

interface IsQuizNameValidReturnObject {
  result: boolean;
  error?: string;
}

interface QuizInfoReturn {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
}

interface QuizInfoInTrashObject {
  quizId: number;
  name: string;
}

interface QuizInfoInTrashReturn {
  quizzes: QuizInfoInTrashObject[];
}

interface ListArray {
  quizId: number;
  name: string;
}

interface QuizListReturn {
  quizzes: ListArray[];
}

// TypeScript interfaces - END

export function adminQuizCreateV2(token: string, name: string, description: string)
: QuizId | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();
  const isTokenValidTest = isTokenValid(data, token);

  if (!isTokenValidTest) {
    throw httpError(401, 'Token is empty or invalid');
  }

  // checks valid authUserId
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isQuizNameValidTest = isQuizNameValid(
    data,
    name,
    authUserId.authUserId
  );

  if (!isQuizNameValidTest.result) {
    throw httpError(400, 'Quiz name is invalid');
  }

  // description is not more than 100 characters in length - error 400
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw httpError(400, 'Description is more than 100 characters in length');
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
  });

  // Add quizId to quizId[] array in data.users
  pushNewQuizIdToUserArray(data, authUserId.authUserId, newQuizId);
  saveDataInFile(data);

  return {
    quizId: newQuizId,
  };
}

/**
 * Printing out the the quiz information (added new object for iteration 2)
 *
 * @param {string} token - the token of the person want to print quiz - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz being print - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object with error code if an error occurs
 * @returns {{quizInfo}} - an object with all the quiz informations
 */
function adminQuizInfo(
  token: string,
  quizId: number
): QuizInfoReturn | ErrorObjectWithCode {
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
    return {
      error: 'QuizId does not match authUserId',
      errorCode: RESPONSE_ERROR_403,
    };
  }
  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isQuizIdValidTest) {
    return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
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

export { adminQuizInfo };

/**
 * Printing out the the quiz information in trash
 * for the currently logged in user
 *
 * @param {string} token - the token of the person want to print quiz - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {{quizInfo}} - an array with all the quiz informations
 */
function getQuizzesInTrashForLoggedInUser(
  token: string
): QuizInfoInTrashReturn | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();

  // Step 1 test for 401 error - START

  const isTokenValidTest = isTokenValid(data, token);

  if (!isTokenValidTest) {
    return {
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
      errorCode: RESPONSE_ERROR_401,
    };
  }
  // Step 1 test for 401 error - END

  // all error cases have been dealt with,
  // now return the quizzes array
  const authUserIdObj = getAuthUserIdUsingToken(data, token) as AuthUserId;
  const authUserId = authUserIdObj.authUserId;

  const trashQuizArray = data.trash;

  const quizzesArray = [];

  for (const quiz of trashQuizArray) {
    if (quiz.userId.includes(authUserId)) {
      const tempArray = {
        quizId: quiz.quizId,
        name: quiz.name,
      };
      quizzesArray.push(tempArray);
    }
  }

  return { quizzes: quizzesArray };
}

export { getQuizzesInTrashForLoggedInUser };

/**
 * Refactored for Iteration 2
 * Creates a new quiz for the logged in user, returning an object containing
 * a unique quizId
 *
 * @param {string} token - the token of the person creating the quiz - must exist / be valid / be unique
 * @param {string} name - name of the quiz being created
 * @param {string} description - description of the quiz being created
 * ...
 *
 * @returns {{array}} - if an error occurs, an array of an
 * error object containing an error message, and
 * an errorCode object with error codes 400 or 401
 * @returns {{quizId: number}} - an object with the key quizId and the value the, unique, quizId
 */

function adminQuizCreate(
  token: string,
  name: string,
  description: string
): QuizId | ErrorObjectWithCode {
  // let data = getData();

  // Iteration 2: New data retrieval system - START
  const data: DataStore = retrieveDataFromFile();
  // Iteration 2: New data retrieval system - END
  // 1. check that authUserId is valid
  // if not, then return error
  // const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);

  // 1. check that token is valid
  // if not, then return error

  const isTokenValidTest = isTokenValid(data, token);

  if (!isTokenValidTest) {
    return {
      error: 'Token is empty or invalid',
      errorCode: RESPONSE_ERROR_401,
    };
  }

  // 2a. get authUserId using token

  const authUserId = getAuthUserIdUsingToken(data, token);

  // 2. check that quiz name is valid
  // if not, then return error
  const isQuizNameValidTest = isQuizNameValid(
    data,
    name,
    authUserId.authUserId
  );

  if (!isQuizNameValidTest.result) {
    return { error: isQuizNameValidTest.error, errorCode: RESPONSE_ERROR_400 };
  }

  // 3. check that description is not more than 100 characters in length
  // if not, then return error
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      error:
        'Description is more than 100 characters in length (note: empty strings are OK)',
      errorCode: RESPONSE_ERROR_400,
    };
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
  });

  // Add quizId to quizId[] array in data.users
  // Step 1. mutate relevant array of authUserId from data.users

  pushNewQuizIdToUserArray(data, authUserId.authUserId, newQuizId);

  // Iteration 2: New data save system - START
  saveDataInFile(data);
  // Iteration 2: New data save system - END

  // setData(data);

  return {
    quizId: newQuizId,
  };
}

export { adminQuizCreate };

/**
 * Update the description of the relevant quiz.
 *
 * @param {string} token - the token of the person want to update quiz's description - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz being update - must exist / be valid / be unique
 * @param {string} description - the new description of the quiz
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object if an error occurs
 * @returns {} - return nothing
 */
function adminQuizDescriptionUpdate(
  token: string,
  quizId: number,
  description: string
): Record<string, never> | ErrorObjectWithCode {
  // const data = getData();
  const data: DataStore = retrieveDataFromFile();

  // get authUserId from Token
  const authUserIdObj = getAuthUserIdUsingToken(data, token) as AuthUserId;
  const authUserId = authUserIdObj.authUserId;

  // Step 1: Error checks - START
  // Step 1a: Error checks - 400 Errors - START

  // Step 1a 1 Quiz ID does not refer to a valid quiz - 400 - START

  if (!isQuizIdValid(data, quizId)) {
    return {
      error: 'quizId does not refer to a valid quiz.',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  // Step 1a 1 Quiz ID does not refer to a valid quiz - 400 - END

  // Step 1a 2 Description is more than 100 characters in length (note: empty strings are OK) - 400 - START

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      error:
        'Description is more than 100 characters in length (note: empty strings are OK)',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  // Step 1a 2 Description is more than 100 characters in length (note: empty strings are OK) - 400 - END
  // Step 1a: Error checks - 400 Errors - END

  // Step 1b: Error checks - 401 Errors - START
  // Token is empty or invalid (does not refer to valid logged in user session) - START

  const isTokenValidTest = isTokenValid(data, token) as boolean;

  if (!isTokenValidTest) {
    return {
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
      errorCode: RESPONSE_ERROR_401,
    };
  }

  // Token is empty or invalid (does not refer to valid logged in user session) - END
  // Step 1b: Error checks - 401 Errors - END

  // Step 1c: Error checks - 403 Errors - START
  // Token is empty or invalid (does not refer to valid logged in user session)
  // Need:
  // a. authUserId
  // b. quizId
  // Then:
  // x. iterate over data.users
  // y. find user array that corresponds with authUserId
  // z. check in that user's quizid array to test whether quizId is included

  // x
  const userArr = data.users;

  let userOwnsQuizBool = false;

  for (const user of userArr) {
    if (user.authUserId === authUserId && user.quizId.includes(quizId)) {
      userOwnsQuizBool = true;
    }
  }

  if (!userOwnsQuizBool) {
    return {
      error: 'Valid token is provided, but user is not an owner of this quiz',
      errorCode: RESPONSE_ERROR_403,
    };
  }

  // Step 1c: Error checks - 403 Errors - END
  // Step 1: Error checks - END

  // All error cases have been dealt with
  // now mutate the dataStore by updating
  // the description and the timeLastEdited

  const quizArr = data.quizzes;
  for (const quiz of quizArr) {
    if (quiz.quizId === quizId) {
      quiz.description = description;
      quiz.timeLastEdited = createCurrentTimeStamp();
    }
  }

  saveDataInFile(data);

  return {};
}

export { adminQuizDescriptionUpdate };

/**
 * Update the name of the relevant quiz.
 *
 * @param {string} token - the token of the person want to update quiz's name - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz being change - must exist / be valid / be unique
 * @param {string} name - the new name of the quiz - must be valid / unique
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object if an error occurs
 * @returns {} - return nothing
 */
function adminQuizNameUpdate(
  token: string,
  quizId: number,
  name: string
): Record<string, never> | ErrorObjectWithCode {
  // const data = getData();
  const data: DataStore = retrieveDataFromFile();

  // Step 1 - check for errors - START
  // Check for 400 errors - START
  // Step 1a - Quiz ID does not refer to a valid quiz - START
  if (!isQuizIdValid(data, quizId)) {
    return {
      error: 'QuizId does not refer to a valid quiz.',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  // Step 1a - Quiz ID does not refer to a valid quiz - END
  // Step 1b - START
  // Name contains invalid characters. Valid characters are alphanumeric and spaces AND
  // Name is already used by the current logged in user for another quiz

  // get authUserId from Token
  const authUserIdObj = getAuthUserIdUsingToken(data, token) as AuthUserId;
  const authUserId = authUserIdObj.authUserId;

  // check if quiz name is valid
  const isQuizNameValidTest = isQuizNameValid(data, name, authUserId);
  if (!isQuizNameValidTest.result) {
    return {
      error:
        'Name contains invalid characters. Valid characters are alphanumeric and spaces, or Name is already used by the current logged in user for another quiz',
      errorCode: RESPONSE_ERROR_400,
    };
  }
  // Step 1b - END

  // Step 1c - Name is either less than 3 characters long or more than 30 characters long - START

  if (
    name.length < MIN_QUIZ_NAME_LENGTH ||
    name.length > MAX_QUIZ_NAME_LENGTH
  ) {
    return {
      error:
        'Name is either less than 3 characters long or more than 30 characters long',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  // Step 1c - Name is either less than 3 characters long or more than 30 characters long - END
  // Check for 400 errors - END

  // Step 2: Check for 401 errors - START
  // Token is empty or invalid (does not refer to valid logged in user session)

  const isTokenValidTest = isTokenValid(data, token) as boolean;

  if (!isTokenValidTest) {
    return {
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
      errorCode: RESPONSE_ERROR_401,
    };
  }

  // Step 2: Check for 401 errors - END

  // Step 3: Check for 403 errors - START
  // Token is empty or invalid (does not refer to valid logged in user session)
  // Need:
  // a. authUserId
  // b. quizId
  // Then:
  // x. iterate over data.users
  // y. find user array that corresponds with authUserId
  // z. check in that user's quizid array to test whether quizId is included

  // x
  const userArr = data.users;

  let userOwnsQuizBool = false;

  for (const user of userArr) {
    if (user.authUserId === authUserId && user.quizId.includes(quizId)) {
      userOwnsQuizBool = true;
    }
  }

  if (!userOwnsQuizBool) {
    return {
      error: 'Valid token is provided, but user is not an owner of this quiz',
      errorCode: RESPONSE_ERROR_403,
    };
  }

  // Step 3: Check for 403 errors - END
  // Step 1 - check for errors - END

  // All errors have been dealt with
  // now mutate the dataStore
  // by updating the quiz name

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.name = name;
      quiz.timeLastEdited = createCurrentTimeStamp();
    }
  }
  saveDataInFile(data);
  return {};
}
export { adminQuizNameUpdate };

/**
 * Transfer ownership of a quiz to a different user based on their email
 *
 * @param {string} token - the token of the person who is transferring the quiz (Transferor) - must exist / be valid / be unique
 * @param {string} userEmail - the email of the person to whom the quiz is to be transferred (Transferee) - must exist
 * @param {number} quizId - the id of the quiz being transferred - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object if an error occurs
 * @returns {} - return nothing
 */
function adminQuizTransfer(
  token: string,
  userEmail: string,
  quizId: number
): Record<string, never> | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();

  // Step 1 - check for errors - START

  // Step 1a: Check for 401 errors - START
  // Token is empty or invalid (does not refer to valid logged in user session)

  const isTokenValidTest = isTokenValid(data, token) as boolean;

  if (!isTokenValidTest) {
    return {
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
      errorCode: RESPONSE_ERROR_401,
    };
  }

  // Step 1a: Check for 401 errors - END

  // Step 1b: Check for 403 errors - START
  // Token is empty or invalid (does not refer to valid logged in user session)
  // Need:
  // a. authUserId
  // b. quizId
  // Then:
  // x. iterate over data.users
  // y. find user array that corresponds with authUserId
  // z. check in that user's quizid array to test whether quizId is included

  // x

  // get authUserId from Token
  const authUserIdObj = getAuthUserIdUsingToken(data, token) as AuthUserId;
  const authUserIdTransferor = authUserIdObj.authUserId;
  const userArr = data.users;

  let userOwnsQuizBool = false;

  for (const user of userArr) {
    if (
      user.authUserId === authUserIdTransferor &&
      user.quizId.includes(quizId)
    ) {
      userOwnsQuizBool = true;
    }
  }

  if (!userOwnsQuizBool) {
    return {
      error: 'Valid token is provided, but user is not an owner of this quiz',
      errorCode: RESPONSE_ERROR_403,
    };
  }

  // Step 1b: Check for 403 errors - END

  // Check for 400 errors - START

  // Step 1c: Check for userEmail is not a real user - START
  // includes whether email is valid

  if (!isEmail(userEmail) || !isUserEmailRealUser(data, userEmail)) {
    return {
      error: 'userEmail is not a real user',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  // Step 1c: Check for userEmail is not a real user - START

  // Step 1d: Check userEmail is the current logged in user - START
  // includes whether email is valid

  if (isUserEmailIsCurrentLoggedInUser(data, token, userEmail)) {
    return {
      error: 'userEmail is the current logged in user',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  // Step 1d: Check userEmail is the current logged in user - END

  // Step 1e: Quiz ID refers to a quiz that has a name that is already used by the target user - START

  // step 1: get name of quiz from quizId
  // step 2: get array of all quiz names of transferee via userEmail
  // step 3: confirm authUserId of transferee via userEmail: new function
  // step 4: iterate over quiz array and make array of all quiz names where quizzes.userId includes authUserId of transferee
  // step 5: check if name of quiz being transferred is in this array. If so, then ERROR, if not, then OK

  // step 1: get name of quiz being transferred
  const quizArr = data.quizzes;
  let transferQuizName: string;
  for (const quiz of quizArr) {
    if (quiz.quizId === quizId) {
      transferQuizName = quiz.name;
    }
  }

  // step 2 & 3: get authUserId of transferee via email
  let transfereeAuthUserId: number;
  for (const user of userArr) {
    if (user.email === userEmail) {
      transfereeAuthUserId = user.authUserId;
    }
  }

  // step 4: make array of all quiz names where quizzes.userId includes authUserId of transferee

  const quizNamesArray: string[] = [];

  for (const quiz of quizArr) {
    if (quiz.userId.includes(transfereeAuthUserId)) {
      quizNamesArray.push(quiz.name);
    }
  }

  if (quizNamesArray.includes(transferQuizName)) {
    return {
      error:
        'Quiz ID refers to a quiz that has a name that is already used by the target user',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  // Step 1e: Quiz ID refers to a quiz that has a name that is already used by the target user - END

  // Check for 400 errors - END

  // Step 1 - check for errors - END

  // All errors have been dealt with
  // now mutate the dataStore
  // by transferring the quiz to the transferee

  for (const quiz of quizArr) {
    if (quiz.quizId === quizId) {
      // get index of element to be replaced
      const indexToReplace = quiz.userId.indexOf(authUserIdTransferor);

      // Ensure element can be found in array
      if (indexToReplace !== -1) {
        // Replace old element with new element
        quiz.userId.splice(indexToReplace, 1, transfereeAuthUserId);
      }
      // update timeLastEdited
      quiz.timeLastEdited = createCurrentTimeStamp();
    }
  }

  // also mutate the users array
  // transfer the quizId from the transferor to transferee
  // in users.quizId

  // Remove quizId from users.quizId of transferor

  for (const user of userArr) {
    if (user.authUserId === authUserIdTransferor) {
      // remove quizId from transferor's quizId array
      const index = user.quizId.indexOf(quizId);
      if (index !== -1) {
        user.quizId.splice(index, 1);
      }
    }
  }

  // Add quizId to users.quizId of transferee

  for (const user of userArr) {
    if (user.authUserId === transfereeAuthUserId) {
      user.quizId.push(quizId);
    }
  }

  saveDataInFile(data);
  return {};
}
export { adminQuizTransfer };

// TO HERE - END

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {string} token - the token of the person want to print quizzes - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object if an error occurs
 * @returns {{quizzes: array}} - return all quizzes that contain the user's authUserId
 */
function adminQuizList(token: string): QuizListReturn | ErrorObjectWithCode {
  const data = retrieveDataFromFile();
  const quizzesList = [];
  const isTokenValidTest = isTokenValid(data, token);
  const authUserId = getAuthUserIdUsingToken(data, token);

  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  for (const quiz of data.quizzes) {
    if (quiz.userId.includes(authUserId.authUserId)) {
      quizzesList.push({
        quizId: quiz.quizId,
        name: quiz.name,
      });
    }
  }
  return { quizzes: quizzesList };
}

export { adminQuizList };

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {string} token - the token of the person want to print quizzes - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz want to be delete - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object if an error occurs
 * @returns {} - return nothing
 */
function adminQuizRemove(
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
    return {
      error: 'QuizId does not match authUserId',
      errorCode: RESPONSE_ERROR_403,
    };
  }
  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isQuizIdValidTest) {
    return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
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

export { adminQuizRemove };

// NEW FUNCTIONS FOR ITERATION 2 - START

/**
 * Print the quizzes in trash
 *
 * @param {string} token - the token of the person who wants to print quizzes - must exist / be valid / be unique
 *
 * @returns {{error: string}, {errorCode: number}} - an error object with error code if an error occurs
 * @returns {} - return nothing
 */
function adminTrashQuizList(
  token: string
): QuizListReturn | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();

  const isTokenValidTest = isTokenValid(data, token);
  const authUserId = getAuthUserIdUsingToken(data, token);
  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  const trashArray = [];
  const quizIdArray = [];
  for (const checkId of data.users) {
    if (checkId.authUserId === authUserId.authUserId) {
      quizIdArray.push(...checkId.quizId);
    }
  }
  for (const checkQuizzes of data.trash) {
    for (const checkUserId of checkQuizzes.userId) {
      if (checkUserId === authUserId.authUserId) {
        trashArray.push(checkQuizzes);
      }
    }
  }
  return { quizzes: trashArray };
}

export { adminTrashQuizList };

/**
 * Restore the quizzes in trash with the provided quizId
 *
 * @param {string} token - the token of the person who wants to delete quizzes - must exist / be valid / be unique
 * @param {number[]} quizId - the id of the quizzes want to restore - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object with error code if an error occurs
 * @returns {} - return nothing
 */
function adminTrashQuizRestore(
  token: string,
  quizId: number
): Record<string, never> | ErrorObjectWithCode {
  const data = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isTokenValidTest = isTokenValid(data, token);
  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  if (!Number.isInteger(quizId) || quizId < 0) {
    return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
  }
  if (!isQuizIdInTrash(data, quizId)) {
    if (!isQuizIdValid(data, quizId)) {
      return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
    }
    if (!isAuthUserIdMatchQuizId(data, authUserId.authUserId, quizId)) {
      return {
        error: 'QuizId does not match authUserId',
        errorCode: RESPONSE_ERROR_403,
      };
    }
    return { error: 'QuizId is not in trash', errorCode: RESPONSE_ERROR_400 };
  }
  if (!isAuthUserIdMatchTrashQuizId(data, authUserId.authUserId, quizId)) {
    return {
      error: 'QuizId does not match authUserId',
      errorCode: RESPONSE_ERROR_403,
    };
  }

  const newdata = data;
  const userToUpdata = data.users.find(
    (user) => user.authUserId === authUserId.authUserId
  );
  const quizToRestore = data.trash.filter((quiz) => quiz.quizId === quizId);
  const isQuizNameValidTest = isQuizNameValid(
    data,
    quizToRestore[0].name,
    authUserId.authUserId
  );
  if (!isQuizNameValidTest.result) {
    return { error: isQuizNameValidTest.error, errorCode: RESPONSE_ERROR_400 };
  }
  quizToRestore[0].timeLastEdited = Math.floor(
    Date.now() / CONVERT_MSECS_TO_SECS
  );
  newdata.trash = newdata.trash.filter((quiz) => quiz.quizId !== quizId);
  userToUpdata.quizId.push(quizId);
  for (let check of newdata.users) {
    if (check.authUserId === authUserId.authUserId) {
      check = userToUpdata;
    }
  }
  newdata.quizzes.push(quizToRestore[0]);
  saveDataInFile(newdata);
  return {};
}

export { adminTrashQuizRestore };

/**
 * Delete the quizzes in trash with the provided quizId array
 *
 * @param {string} token - the token of the person who wants to delete quizzes - must exist / be valid / be unique
 * @param {number[]} quizIds - array of the id of the quizzes want to delete - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {} - return nothing
 */
function adminTrashQuizEmpty(
  token: string,
  quizIds: number[]
): Record<string, never> | ErrorObjectWithCode {
  const data = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isTokenValidTest = isTokenValid(data, token);
  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  for (const quizId of quizIds) {
    if (!Number.isInteger(quizId) || quizId < 0) {
      return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
    }
    if (!isQuizIdInTrash(data, quizId)) {
      if (!isQuizIdValid(data, quizId)) {
        return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
      }
      if (!isAuthUserIdMatchQuizId(data, authUserId.authUserId, quizId)) {
        return {
          error: 'QuizId does not match authUserId',
          errorCode: RESPONSE_ERROR_403,
        };
      }
      return { error: 'QuizId is not in trash', errorCode: RESPONSE_ERROR_400 };
    }
    if (!isAuthUserIdMatchTrashQuizId(data, authUserId.authUserId, quizId)) {
      return {
        error: 'QuizId does not match authUserId',
        errorCode: RESPONSE_ERROR_403,
      };
    }
  }
  const newdata = data;
  for (const quizId of quizIds) {
    newdata.trash = data.trash.filter((quiz) => quiz.quizId === quizId);
  }
  if (quizIds.length === 1 && quizIds[0] === newdata.trash[0].quizId) {
    newdata.trash = [];
  }
  // for (const checkQuiz of newdata.trash) {
  //   const indexToRemove = quizIds.indexOf(checkQuiz.quizId);
  //   if (indexToRemove !== -1) {
  //     newdata.trash.splice(indexToRemove, 1);
  //   }
  // }
  saveDataInFile(newdata);
  return {};
}

export { adminTrashQuizEmpty };

// NEW FUNCTIONS FOR ITERATION 2 - END

// HELPER FUNCTIONS - START ------------------------------------------------------------------------

/**
 * Function to test whether quiz name is valid
 * quiz name is invalid if:
 * - contains invalid characters. Valid characters are alphanumeric and spaces
 * - either less than 3 characters long or more than 30 characters long
 * - already used by the current logged in user for another quiz
 * Used in:
 * adminQuizCreate()
 *
 * @param {object} data - the dataStore object
 * @param {string} name - the name of the quiz
 * ...
 *
 * @returns {boolean} - true if authId is valid / false if authId is not valid
 */
function isQuizNameValid(
  data: DataStore,
  name: string,
  userId: number
): IsQuizNameValidReturnObject {
  // 1. test for not containing invalid characters
  // assistance taken from https://regex101.com/codegen?language=javascript

  const regexMain = /^[a-z\d\s]+$/gim;

  const regexMainTest = regexMain.test(name);

  if (!regexMainTest) {
    return {
      result: false,
      error:
        'Name contains invalid characters. Valid characters are alphanumeric and spaces',
    };
  }

  // 2. test for name either less than 3 characters or
  // more than 30 characters long

  if (
    name.length < MIN_QUIZ_NAME_LENGTH ||
    name.length > MAX_QUIZ_NAME_LENGTH
  ) {
    return {
      result: false,
      error:
        'Name is either less than 3 characters long or more than 30 characters long',
    };
  }

  // 3. test for name already being used by the current logged
  // in user for another quiz
  // Logic:
  // a. iterate through quizzes array and look at userId array
  // b. if the authId appears there, then look at the quiz name
  // c. if the quiz name matches the name of the quiz
  // wanting to be created, then return error, else return ok

  const quizzesArr = data.quizzes;

  for (const arr of quizzesArr) {
    if (arr.userId.includes(userId)) {
      if (arr.name === name) {
        return {
          result: false,
          error:
            'Name is already used by the current logged in user for another quiz',
        };
      }
    }
  }

  return { result: true };
}

/**
 * Function to mutate existing user array
 * to add new quizId to quizId array of data.users
 * Used in:
 * adminQuizCreate()
 *
 * @param {object} data - the dataStore object
 * @param {number} authUserId - the authUserId
 * @param {number} quizId - the id of the new quiz created
 * ...
 *
 * @returns {} - nil return; the existing array is mutated
 */
function pushNewQuizIdToUserArray(
  data: DataStore,
  authUserId: number,
  quizId: number
) {
  const userArr = data.users;

  for (const arr of userArr) {
    if (arr.authUserId === authUserId) {
      arr.quizId.push(quizId);
    }
  }
}

/**
 * Function to test whether quizId is valid
 * Used in:
 * adminQuizInfo()
 * adminQuizRemove()
 *
 * @param {object} data - the dataStore object
 * @param {number} quizId - the id of the quiz
 * ...
 *
 * @returns {boolean} - true if authId is valid / false if authId is not valid
 */
function isQuizIdValid(data: DataStore, quizId: number): boolean {
  // 1. test for quizId is integer or less than 0
  if (!Number.isInteger(quizId) || quizId < 0) {
    return false;
  }

  // 2. test that quizId exists in dataStore
  const quizzesArr = data.quizzes;
  const userIdArr = [];
  for (const arr of quizzesArr) {
    if (arr.quizId === quizId) {
      userIdArr.push(quizId);
    }
  }
  if (userIdArr.length === 1) {
    return true;
  }

  return false;
}

/**
 * Function to test whether quiz contains user's authUserId
 * Used in:
 * adminQuizInfo()
 * adminQuizRemove()
 *
 * @param {object} data - the dataStore object
 * @param {number} authId - the id of the person creating the quiz
 * @param {number} quizId - the id of the quiz
 * ...
 *
 * @returns {boolean} - true if authId is valid / false if authId is not valid
 */
export function isAuthUserIdMatchQuizId(
  data: DataStore,
  authUserId: number,
  quizId: number
): boolean {
  const usersArr = data.users;
  const userQuizIdArr = [];
  for (const arr of usersArr) {
    if (arr.authUserId === authUserId) {
      for (const check of arr.quizId) {
        if (check === quizId) {
          userQuizIdArr.push(quizId);
        }
      }
    }
  }
  if (userQuizIdArr.length === 1) {
    return true;
  }
  return false;
}

function isQuizIdInTrash(data: DataStore, quizId: number): boolean {
  if (!Number.isInteger(quizId) || quizId < 0) {
    return false;
  }

  // 2. test that quizId exists in dataStore
  const quizzesArr = data.trash;
  const userIdArr = [];
  for (const arr of quizzesArr) {
    if (arr.quizId === quizId) {
      userIdArr.push(quizId);
    }
  }
  if (userIdArr.length === 1) {
    return true;
  }

  return false;
}

function isAuthUserIdMatchTrashQuizId(
  data: DataStore,
  authUserId: number,
  quizId: number
): boolean {
  const quizArray = [];
  for (const quiz of data.trash) {
    if (quiz.quizId === quizId) {
      for (const check of quiz.userId) {
        if (check === authUserId) {
          quizArray.push(quiz);
        }
      }
    }
  }
  if (quizArray.length === 1) {
    return true;
  }
  return false;
}

/**
 * Function to test whether userEmail is a real user
 *
 * @param {object} data - the dataStore object
 * @param {string} userEmail - the email of the user to whom the quiz is being transferred
 * ...
 *
 * @returns {boolean} - true if userEmail is a real user / false if userEmail is not a real user
 */
export function isUserEmailRealUser(
  data: DataStore,
  userEmail: string
): boolean {
  const usersArr = data.users;
  for (const arr of usersArr) {
    if (arr.email === userEmail) {
      return true;
    }
  }

  return false;
}

/**
 * Function to test whether userEmail is the current logged in user
 *
 * @param {object} data - the dataStore object
 * @param {string} token - the token of the person transferring the quiz
 * @param {string} userEmail - the email of the user to whom the quiz is being transferred
 * ...
 *
 * @returns {boolean} - true if userEmail is the current logged in user / false if userEmail is not the current logged in user
 */
export function isUserEmailIsCurrentLoggedInUser(
  data: DataStore,
  token: string,
  userEmail: string
): boolean {
  const usersArr = data.users;
  for (const arr of usersArr) {
    if (arr.email === userEmail && arr.token.includes(token)) {
      return true;
    }
  }

  return false;
}
