import { getData, setData } from "./dataStore.js";

/**
 * Printing out the the quiz information
 *
 * @param {number} authUserId - the id of the person want to print quiz - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz being print - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {{quizInfo}} - an array with all the quiz informations
 */
function adminQuizInfo(authUserId, quizId) {
  const data = getData();
  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isAuthUserIdMatchQuizIdTest = isAuthUserIdMatchQuizId(
    data,
    authUserId,
    quizId
  );

  if (authUserId === "" || quizId === "") {
    return { error: "AuthUserId and QuizId cannot be empty" };
  }
  if (!isAuthUserIdValidTest) {
    return { error: "AuthUserId is not a valid user" };
  }
  if (!isQuizIdValidTest) {
    return { error: "QuizId is invalid" };
  }
  if (!isAuthUserIdMatchQuizIdTest) {
    return { error: "QuizId does not match authUserId" };
  }

  let quizInfo = {};
  for (const check of data.quizzes) {
    if (check.quizId === quizId) {
      quizInfo = {
        quizId: check.quizId,
        name: check.name,
        timeCreated: check.timeCreated,
        timeLastEdited: check.timeLastEdited,
        description: check.description,
      };
    }
  }

  return quizInfo;
}

export { adminQuizInfo };

/**
 * Creates a new quiz for the logged in user, returning an object containing
 * a unique quizId
 *
 * @param {number} authUserId - the id of the person creating the quiz - must exist / be valid / be unique
 * @param {string} name - name of the quiz being created
 * @param {string} description - description of the quiz being created
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {{quizId: number}} - an object with the key quizId and the value the, unique, quizId
 */

function adminQuizCreate(authUserId, name, description) {
  let data = getData();
  // 1. check that authUserId is valid
  // if not, then return error
  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);

  if (!isAuthUserIdValidTest) {
    return { error: "AuthUserId is not a valid user" };
  }

  // 2. check that quiz name is valid
  // if not, then return error
  const isQuizNameValidTest = isQuizNameValid(data, name, authUserId);

  if (!isQuizNameValidTest.result) {
    return { error: isQuizNameValidTest.error };
  }

  // 3. check that description is not more than 100 characters in length
  // if not, then return error
  if (description.length > 100) {
    return {
      error:
        "Description is more than 100 characters in length (note: empty strings are OK)",
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
  const timeStamp = Math.floor(Date.now() / 1000);

  data.quizzes.push({
    quizId: newQuizId,
    name,
    description,
    timeCreated: timeStamp,
    timeLastEdited: timeStamp,
    userId: [authUserId],
  });

  // Add quizId to quizId[] array in data.users
  // Step 1. mutate relevant array of authUserId from data.users

  pushNewQuizIdToUserArray(data, authUserId, newQuizId);

  setData(data);

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
function adminQuizNameUpdate(authUserId, quizId, name) {
  let data = getData();
  // 1. check that authUserId is valid
  // if not, then return error
  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);
  if (!isAuthUserIdValidTest) {
    return { error: "AuthUserId is not a valid user" };
  }

  if (!isQuizIdValid(data, quizId)) {
    return { error: "QuizId does not refer to a valid quiz." };
  }

  if (!doesQuizIdRefer(quizId, authUserId)) {
    return { error: "Quiz ID does not refer to a quiz that this user owns" };
  }

  const isQuizNameValidTest = isQuizNameValid(data, name, authUserId);
  if (!isQuizNameValidTest.result) {
    return { error: isQuizNameValidTest.error };
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

function doesQuizIdRefer(quizId, authUserId) {
  // let is_valid = False;
  const data = getData();
  for (let quiz of data.quizzes) {
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
 * @param {number} authUserId - the id of the person want to print quizzes - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {{quizzes: array}} - return all quizzes that contain the user's authUserId
 */
function adminQuizList(authUserId) {
  let data = getData();
  let quizzesList = [];
  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);
  if (!isAuthUserIdValidTest) {
    return { error: "AuthUserId is not a valid user" };
  }
  for(const quiz of data.quizzes){
    if (quiz.userId.includes(authUserId)){
      quizzesList.push({
        quizId: quiz.quizId,
        name: quiz.name,
      });
    }
  }
  return {quizzes: quizzesList};
  console.log(quizzesList);
}

export { adminQuizList };

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {number} authUserId - the id of the person want to print quizzes - must exist / be valid / be unique
 * @param {number} quizId - the id of the quiz want to be delete - must exist / be valid / be unique
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {} - return nothing
 */
function adminQuizRemove(authUserId, quizId) {
  let data = getData();
  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isAuthUserIdMatchQuizIdTest = isAuthUserIdMatchQuizId(
    data,
    authUserId,
    quizId
  );

  if (authUserId === "" || quizId === "") {
    return { error: "AuthUserId and QuizId cannot be empty" };
  }
  if (!isAuthUserIdValidTest) {
    return { error: "AuthUserId is not a valid user" };
  }
  if (!isQuizIdValidTest) {
    return { error: "QuizId is invalid" };
  }
  if (!isAuthUserIdMatchQuizIdTest) {
    return { error: "QuizId does not match authUserId" };
  }

  let newdata = data;
  let userToUpdata = data.users.find((user) => user.authUserId === authUserId);
  data.quizzes = data.quizzes.filter((quiz) => quiz.quizId !== quizId);
  if (userToUpdata) {
    const indexToRemove = userToUpdata.quizId.indexOf(quizId);
    if (indexToRemove !== -1) {
      userToUpdata.quizId.splice(indexToRemove, 1);
    }
  }
  for (const check of newdata.users) {
    if (newdata.users.authUserId === authUserId) {
      newdata.users[check] = userToUpdata;
    }
  }
  setData(newdata);
  return {};
}

export { adminQuizRemove };

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
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  const data = getData();
  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);

  if (!isAuthUserIdValidTest) {
    return { error: "AuthUserId is not a valid user" };
  }

  if (!isQuizIdValid(data, quizId)) {
    return { error: "quizId does not refer to a valid quiz." };
  }

  if (!doesQuizIdRefer(quizId, authUserId)) {
    return { error: "Quiz ID does not refer to a quiz that this user owns" };
  }
  if (description.length > 100) {
    return {
      error:
        "Description is more than 100 characters in length (note: empty strings are OK)",
    };
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      quiz.description === description;
    }
  }

  return {};
}

export { adminQuizDescriptionUpdate };

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
function isAuthUserIdValid(data, authId) {
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
  let userIdArr = [];

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
function isQuizNameValid(data, name, userId) {
  // 1. test for not containing invalid characters
  // assistance taken from https://regex101.com/codegen?language=javascript
  const regexMain = /^[a-z\d\s]+$/gim;

  const regexMainTest = regexMain.test(name);

  if (!regexMainTest) {
    return {
      result: false,
      error:
        "Name contains invalid characters. Valid characters are alphanumeric and spaces",
    };
  }

  // 2. test for name either less than 3 characters or
  // more than 30 characters long

  if (name.length < 3 || name.length > 30) {
    return {
      result: false,
      error:
        "Name is either less than 3 characters long or more than 30 characters long",
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
            "Name is already used by the current logged in user for another quiz",
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
function pushNewQuizIdToUserArray(data, authUserId, quizId) {
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
function isQuizIdValid(data, quizId) {
  // 1. test for quizId is integer or less than 0
  if (!Number.isInteger(quizId) || quizId < 0) {
    return false;
  }

  // 2. test that quizId exists in dataStore
  const quizzesArr = data.quizzes;
  let userIdArr = [];
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
function isAuthUserIdMatchQuizId(data, authUserId, quizId) {
  const usersArr = data.users;
  let userQuizIdArr = [];
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
