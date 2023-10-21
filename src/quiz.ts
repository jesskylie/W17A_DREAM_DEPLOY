import { getData, setData, DataStore, Quizzes } from './dataStore';
import {
  retrieveDataFromFile,
  saveDataInFile,
  isTokenValid,
  getAuthUserIdUsingToken,
} from './functions';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

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
  /*
  (Part 2)
  numQuestions: number;
  questions: QuestionsArray[];
  duration: number;
}
interface QuestionsArray {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answer: AnswerArray[];
}
interface AnswerArray {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
*/
}

interface ListArray {
  quizId: number;
  name: string;
}

interface QuizListReturn {
  quizzes: ListArray[];
}

// TypeScript interfacts - END

// CONSTANTS - START

const CONVERT_MSECS_TO_SECS = 1000;

// used in adminQuizCreate
const MAX_DESCRIPTION_LENGTH = 100;
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 30;

// CONSTANTS - END

/**
 * Printing out the the quiz information
 *
 * @param {string} token - the token of the person want to print quiz - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz being print - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {{quizInfo}} - an array with all the quiz informations
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
  if (!isQuizIdValidTest) {
    return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
  }
  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isAuthUserIdMatchQuizIdTest) {
    return {
      error: 'QuizId does not match authUserId',
      errorCode: RESPONSE_ERROR_403,
    };
  }

  for (const check of data.quizzes) {
    if (check.quizId === quizId) {
      return {
        quizId: check.quizId,
        name: check.name,
        timeCreated: check.timeCreated,
        timeLastEdited: check.timeLastEdited,
        description: check.description,
        /*
        for part 2
        numQuestions: check.numQuestions,
        questions: check.questions,
        duration: check.duration,
        */
      };
    }
  }
}

export { adminQuizInfo };

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
  const length = data.quizzes.length;
  let newQuizId;
  if (length === 0) {
    newQuizId = 0;
  } else {
    newQuizId = data.quizzes[length - 1].quizId + 1;
  }

  // Inspiration taken from
  // https://stackoverflow.com/questions/3830244/how-to-get-the-current-date-or-and-time-in-seconds
  const timeStamp = Math.floor(Date.now() / CONVERT_MSECS_TO_SECS);

  data.quizzes.push({
    quizId: newQuizId,
    name,
    description,
    timeCreated: timeStamp,
    timeLastEdited: timeStamp,
    userId: [authUserId.authUserId],
    questions: [],
    numQuestions: 0,
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
 * Update the name of the relevant quiz.
 *
 * @param {number} authUserId - the id of the person want to print quiz - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz being print - must exist / be valid / be unique
 * @param {number} name - the new name of the quiz - must valid
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {} - return nothing
 */
function adminQuizDescriptionUpdate(
  authUserId: number,
  quizId: number,
  description: string
): Record<string, never> | { error: string; errorCode: number } {
  const data = getData();
  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);

  if (!isAuthUserIdValidTest) {
    return {
      error: 'AuthUserId is not a valid user',
      errorCode: RESPONSE_ERROR_401,
    };
  }

  if (!isQuizIdValid(data, quizId)) {
    return {
      error: 'quizId does not refer to a valid quiz.',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  if (!doesQuizIdRefer(quizId, authUserId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      errorCode: RESPONSE_ERROR_403,
    };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      error:
        'Description is more than 100 characters in length (note: empty strings are OK)',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  const timeStamp = Math.floor(Date.now() / CONVERT_MSECS_TO_SECS);

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.description = description;
      quiz.timeLastEdited = timeStamp;
    }
  }

  return {};
}

export { adminQuizDescriptionUpdate };

function adminQuizNameUpdate(
  token: string,
  quizId: number,
  name: string
): Record<string, never> | { error: string; errorCode: number } {
  const data = getData();
  // 1. check that authUserId is valid
  // if not, then return error
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId.authUserId);
  for (const user of data.users) {
    if (!user.token.includes(token)) {
      return {
        error: 'Token is invalid or empty',
        errorCode: RESPONSE_ERROR_401,
      };
    }
  }

  if (!isQuizIdValid(data, quizId)) {
    return {
      error: 'QuizId does not refer to a valid quiz.',
      errorCode: RESPONSE_ERROR_400,
    };
  }

  if (!doesQuizIdRefer(quizId, authUserId.authUserId)) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns',
      errorCode: RESPONSE_ERROR_403,
    };
  }

  const isQuizNameValidTest = isQuizNameValid(
    data,
    name,
    authUserId.authUserId
  );
  if (!isQuizNameValidTest.result) {
    return { error: isQuizNameValidTest.error, errorCode: RESPONSE_ERROR_400 };
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.name === name;
      quiz.timeLastEdited++;
    }
  }
  return {};
}
export { adminQuizNameUpdate };

function doesQuizIdRefer(quizId: number, authUserId: number) {
  // let is_valid = False;
  const data = getData();
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      for (const userId of quiz.userId) {
        if (userId === authUserId) {
          return true;
        }
      }
    }
  }
  return false;
}

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
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {} - return nothing
 */
function adminQuizRemove(
  token: string,
  quizId: number
): Record<string, never> | ErrorObjectWithCode {
  const data = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isTokenValidTest = isTokenValid(data, token);
  const isAuthUserIdMatchQuizIdTest = isAuthUserIdMatchQuizId(
    data,
    authUserId.authUserId,
    quizId
  );
  // console.log(data.users);
  // console.log(data.quizzes);
  if (!isQuizIdValidTest) {
    return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
  }
  if (!token) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isAuthUserIdMatchQuizIdTest) {
    return {
      error: 'QuizId does not match authUserId',
      errorCode: RESPONSE_ERROR_403,
    };
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

// ************************************************************************************
// New functions for Iteration 2 Part 2:
function adminTrashQuizList(
  token: string
): QuizListReturn | ErrorObjectWithCode {
  const data = retrieveDataFromFile();
  const isTokenValidTest = isTokenValid(data, token);
  const authUserId = getAuthUserIdUsingToken(data, token);
  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  let trashArray = [];
  let quizIdArray = [];
  for (const checkId of data.users) {
    if (checkId.authUserId === authUserId.authUserId) {
      quizIdArray.push(...checkId.quizId)
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
  if (typeof quizId !== "number") {
    return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
  }
  if (!isQuizIdInTrash(data, quizId)) {
    return { error: 'QuizId is not in trash', errorCode: RESPONSE_ERROR_400 }
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
  let quizToRestore = data.trash.filter((quiz) => quiz.quizId === quizId);
  const isQuizNameValidTest = isQuizNameValid(data, quizToRestore[0].name, authUserId.authUserId);
  if (!isQuizNameValidTest.result) {
    return { error: isQuizNameValidTest.error, errorCode: RESPONSE_ERROR_400 };
  }
  quizToRestore[0].timeLastEdited = Math.floor(Date.now() / CONVERT_MSECS_TO_SECS);
  newdata.trash = newdata.trash.filter((quiz) => quiz.quizId !== quizId);
  userToUpdata.quizId.push(quizId);


  // data.trash = data.trash.filter((quiz) => quiz.quizId !== quizId);
  // if (userToUpdata) {
  //   // const indexToRemove = userToUpdata.quizId.indexOf(quizId);
  //   // if (indexToRemove !== -1) {
  //   //   userToUpdata.quizId.splice(indexToRemove, 1);
  //   // }
  //   userToUpdata.quizId.push(quizId);
  // }
  for (let check of newdata.users) {
    if (check.authUserId === authUserId.authUserId) {
      check = userToUpdata;
    }
  }
  // quizToRestore[0].timeLastEdited = Math.floor(Date.now() / CONVERT_MSECS_TO_SECS);
  newdata.quizzes.push(quizToRestore[0]);
  saveDataInFile(newdata);
  return {};
}

export { adminTrashQuizRestore };

function adminTrashQuizEmpty(
  token: string,
  quizIds: number[]
): Record<string, never> | ErrorObjectWithCode {
  const data = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isTokenValidTest = isTokenValid(data, token);
  console.log(data.trash)
  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  for (const quizId of quizIds) {
    if (typeof quizId !== "number") {
      return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
    }
    if (!isQuizIdInTrash(data, quizId)) {
      return { error: 'QuizId is not in trash', errorCode: RESPONSE_ERROR_400 }
    }
    if (!isAuthUserIdMatchTrashQuizId(data, authUserId.authUserId, quizId)) {
      return {
        error: 'QuizId does not match authUserId',
        errorCode: RESPONSE_ERROR_403,
      };
    }
  }
  let newdata = data;
  for (const quizId of quizIds) {
    newdata.trash = data.trash.filter((quiz) => quiz.quizId === quizId);
  }
  // for (const checkQuiz of newdata.trash) {
  //   const indexToRemove = quizIds.indexOf(checkQuiz.quizId);
  //   if (indexToRemove !== -1) {
  //     newdata.trash.splice(indexToRemove, 1);
  //   }
  // }
  saveDataInFile(newdata);
  console.log(newdata.trash)
  return {};
}

export { adminTrashQuizEmpty };

/**
 * Update the description of the relevant quiz.
 *
 * @param {number} authUserId - the id of the person want to print quizzes - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz want to change description - must exist / be valid / be unique
 * @param {string} description - the new description of the quiz
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {} - return nothing
 */

// HELPER FUNCTIONS - START ------------------------------------------------------------------------

/**
 * Function to test whether authUserId is valid
 * Used in:
 * adminQuizCreate()
 * adminQuizInfo()
 * adminQuizRemove()
 *
 * @param {object} data - the dataStore object
 * @param {number} authId - the id of the person creating the quiz
 * ...
 *
 * @returns {boolean} - true if authId is valid / false if authId is not valid
 */
function isAuthUserIdValid(data: DataStore, authId: number): boolean {
  // 1. test for authId is integer or less than 0
  if (!Number.isInteger(authId) || authId < 0) {
    return false;
  }

  // 2. test that authId exists in dataStore
  // if the authId is found while iterating
  // over the array, the authId is pushed
  // to userIdArr[]
  // If at the end of the iteration, the
  // length of userIdArr[] is exactly 1
  // then: the authId exists and only
  // one copy of authId exists and the boolean
  // true is returned
  // If userIdArr[].length is not exactly 1
  // then either it does not exist, or more than
  // one copy exists, and the boolean false is returned

  const usersArr = data.users;
  const userIdArr = [];

  for (const arr of usersArr) {
    if (arr.authUserId === authId) {
      userIdArr.push(authId);
    }
  }

  // not testing for type equality here
  // as during testing userIdArr.length does not return true
  // for type number
  if (userIdArr.length == 1) {
    return true;
  }

  return false;
}

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

  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
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
function isAuthUserIdMatchQuizId(
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