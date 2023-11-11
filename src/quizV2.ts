import HTTPError from 'http-errors';
import { DataStore } from './dataStore';
import {
  retrieveDataFromFile,
  saveDataInFile,
  isTokenValid,
  getAuthUserIdUsingToken,
  createCurrentTimeStamp,
  getRandomInt,
  isQuizInEndState,
  isThumbnailUrlValid,
} from './library/functions';

import {
  MAX_DESCRIPTION_LENGTH,
  ONE_MILLION,
  MIN_QUIZ_NAME_LENGTH,
  MAX_QUIZ_NAME_LENGTH,
  DEFAULT_VALID_THUMBNAIL_URL,
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

import { GetSessionStatusReturnObj } from './library/interfaces';

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
    thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
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
  if (!isQuizInEndState(data, quizId)) {
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
export function adminQuizInfoV2(
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
        thumbnailUrl: check.thumbnailUrl,
      };
    }
  }
}

/**
 * Update the name of the relevant quiz - Modified for iteration 3
 *
 * @param {string} token - the token of the person want to update quiz's name - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz being change - must exist / be valid / be unique
 * @param {string} name - the new name of the quiz - must be valid / unique
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object if an error occurs
 * @returns {} - return nothing
 */
export function adminQuizNameUpdateV2(
  token: string,
  quizId: number,
  name: string
): Record<string, never> | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();

  const authUserIdObj = getAuthUserIdUsingToken(data, token);
  const authUserId = authUserIdObj.authUserId;
  // invalid quiz name characters - error 400
  const isQuizNameValidTest = isQuizNameValid(data, name, authUserId);
  if (!isQuizNameValidTest.result) {
    throw HTTPError(
      400,
      'Name contains invalid characters or has already been used'
    );
  }
  // quiz name is not between 3-30 characters - error 400
  if (
    name.length < MIN_QUIZ_NAME_LENGTH ||
    name.length > MAX_QUIZ_NAME_LENGTH
  ) {
    throw HTTPError(400, 'Name is not between 3 and 30 characters');
  }
  // Token is empty/invalid - 401 error
  const isTokenValidTest = isTokenValid(data, token) as boolean;
  if (!isTokenValidTest) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  // Valid token is provided but user is now an owner of the quiz - erorr 403
  const userArr = data.users;
  let userOwnsQuizBool = false;
  for (const user of userArr) {
    if (user.authUserId === authUserId && user.quizId.includes(quizId)) {
      userOwnsQuizBool = true;
    }
  }
  if (!userOwnsQuizBool) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.name = name;
      quiz.timeLastEdited = createCurrentTimeStamp();
    }
  }
  saveDataInFile(data);
  return {};
}

/**
 * Update the description of the relevant quiz - Modified for iteration 3
 *
 * @param {string} token - the token of the person want to update quiz's description - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz being update - must exist / be valid / be unique
 * @param {string} description - the new description of the quiz
 * ...
 *
 * @returns {{error: string}, {errorCode: number}} - an error object if an error occurs
 * @returns {} - return nothing
 */
export function adminQuizDescriptionUpdateV2(
  token: string,
  quizId: number,
  description: string
): Record<string, never> | ErrorObjectWithCode {
  // const data = getData();
  const data: DataStore = retrieveDataFromFile();
  const authUserIdObj = getAuthUserIdUsingToken(data, token);
  const authUserId = authUserIdObj.authUserId;
  // description is more than 100 characters - error 400
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw HTTPError(400, 'Description is more than 100 characters');
  }
  // Token is empty/invalid - error 401
  const isTokenValidTest = isTokenValid(data, token) as boolean;
  if (!isTokenValidTest) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  // Valid token provided but user does not own quiz
  const userArr = data.users;
  let userOwnsQuizBool = false;
  for (const user of userArr) {
    if (user.authUserId === authUserId && user.quizId.includes(quizId)) {
      userOwnsQuizBool = true;
    }
  }
  if (!userOwnsQuizBool) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }
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

/**
 * Function to update the thumbnail Url for a quiz
 * @param {number} quizId - the quizId of the quiz to be updated
 * @param {string} token - the token of the person creating the quiz - must exist / be valid / be unique
 * @param {{object}} imgUrl - an object of the new image url - must be valid
 * ...
 * @returns {error object} - if an error occurs, an error object is thrown for error 400, 401, 403
 * @returns {{}} - an empty array if ok
 */

export function adminQuizThumbnailUrlUpdate(
  quizId: number,
  token: string,
  imgUrl: string
): Record<string, never> | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();
  const authUserIdObj = getAuthUserIdUsingToken(data, token);
  const authUserId = authUserIdObj.authUserId;

  // Step 1: ERROR 401
  // test for Token is empty or invalid (does not refer to valid logged in user session) - START

  if (!isTokenValid(data, token)) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  // Step 1: ERROR 401 - END

  // Step 2: ERROR 403
  // test for
  // Valid token is provided, but user is not an owner of this quiz - START

  const userArr = data.users;
  let userOwnsQuizBool = false;
  for (const user of userArr) {
    if (user.authUserId === authUserId && user.quizId.includes(quizId)) {
      userOwnsQuizBool = true;
    }
  }
  if (!userOwnsQuizBool) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  // Step 1: ERROR 403 - END

  // Step 3: ERROR 400 - START

  // If any of the following are true:
  // imgUrl when fetched does not return a valid file
  // imgUrl when fetch is not a JPG or PNG image

  isThumbnailUrlValid(imgUrl);

  // Step 3: ERROR 400 - END

  // NOW THAT ALL ERROR CASES HAVE BEEN DEALT WITH
  // UPDATE THE THUMBNAIL URL

  const quizArr = data.quizzes;
  for (const quiz of quizArr) {
    if (quiz.quizId === quizId) {
      quiz.thumbnailUrl = imgUrl;
      quiz.timeLastEdited = createCurrentTimeStamp();
    }
  }
  saveDataInFile(data);

  return {};
}

/**
 * Function to update the thumbnail Url for a quiz
 * @param {number} quizId - the quizId of the quiz to be updated
 * @param {string} token - the token of the person creating the quiz - must exist / be valid / be unique
 * @param {{object}} imgUrl - an object of the new image url - must be valid
 * ...
 * @returns {error object} - if an error occurs, an error object is thrown for error 400, 401, 403
 * @returns {{}} - an empty array if ok
 */

export function adminQuizGetSessionStatus(
  quizId: number,
  sessionId: number,
  token: string
): GetSessionStatusReturnObj {
  const data: DataStore = retrieveDataFromFile();
  // const authUserIdObj = getAuthUserIdUsingToken(data, token);
  // const authUserId = authUserIdObj.authUserId;

  // console.log('data ->', data);
  // console.log('data.quizzesCopy ->', data.quizzesCopy);

  // Step 1: ERROR 401
  // test for Token is empty or invalid (does not refer to valid logged in user session) - START

  if (!isTokenValid(data, token)) {
    throw HTTPError(
      401,
      'Token is empty or invalid (does not refer to valid logged in user session)'
    );
  }

  console.log('quizV2.ts: data ->', data);
  console.log('quizV2.ts: data.quizzesCopy ->', data.quizzesCopy);
  console.log(
    'quizV2.ts: data.quizzesCopy.metadata.userId ->',
    data.quizzesCopy[0].metadata.userId
  );

  // Step 1: ERROR 401 - END

  /*
  // Step 2: ERROR 403
  // ################ CANNOT BE IMPLEMENTED UNTIL POST v1/player/join is implemented
  // test for
  // Valid token is provided, but user is not authorised to view this session - START
  const userArr = data.users;
  let userOwnsQuizBool = false;
  for (const user of userArr) {
    if (user.authUserId === authUserId && user.quizId.includes(quizId)) {
      userOwnsQuizBool = true;
    }
  }
  if (!userOwnsQuizBool) {
    throw HTTPError(
      403,
      'Valid token is provided, but user is not an owner of this quiz'
    );
  }

  // Step 1: ERROR 403 - END
  */

  // Step 3: ERROR 400 - START

  // If any of the following are true:
  // Session Id does not refer to a valid session within this quiz

  // get the matching quiz object

  const validQuiz = data.quizzesCopy.find(
    (metadata) => (metadata.metadata.quizId = quizId)
  );

  if (!validQuiz) {
    throw HTTPError(
      400,
      'Session Id does not refer to a valid session within this quiz'
    );
  }

  // once the matching quiz has been found, check that the session id
  // of that quiz matches the sessionId

  if (validQuiz.session.sessionId !== sessionId) {
    throw HTTPError(
      400,
      'Session Id does not refer to a valid session within this quiz'
    );
  }

  // Step 3: ERROR 400 - END

  // NOW THAT ALL ERROR CASES HAVE BEEN DEALT WITH
  // return session status object

  // get the relevant session

  const validSession = data.quizzesCopy.find(
    (session) => session.session.sessionId === sessionId
  );

  const sessionStateObj = validSession.session;
  const metadataStateObj = validSession.metadata;

  // remove key userId - not part of return object

  const keyToRemove = 'userId';

  delete metadataStateObj[keyToRemove];

  const sessionStateReturnObj = {
    state: sessionStateObj.state,
    atQuestion: sessionStateObj.atQuestion,
    players: ['Hayden'],
    metadata: metadataStateObj,
  };

  return sessionStateReturnObj;
}
