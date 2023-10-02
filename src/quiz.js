import { getData, setData } from "./dataStore.js";

function adminQuizInfo(authUserId, quizId) {
  return {
    quizId: 1,
    name: "My Quiz",
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: "This is my quiz",
  };
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

  setData(data);

  return {
    quizId: newQuizId,
  };
}

export { adminQuizCreate };

function adminQuizNameUpdate (authUserId, quizId, name) {
  let data = getData();
  // 1. check that authUserId is valid
  // if not, then return error
  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);
  if (!isAuthUserIdValidTest) {
    return { error: "AuthUserId is not a valid user" };
  }

  const isQuizNameValidTest = isQuizNameValid(data, name, authUserId);
  if (!isQuizNameValidTest.result) {
    return { error: isQuizNameValidTest.error };
  }

  if (!isQuizIdValid(quizId)) {
    return { error: "quizId does not refer to a valid quiz."};
  }

  if (!doesQuizIdRefer(quizId, authUserId)) {
    return {error: "Quiz ID does not refer to a quiz that this user owns"};
  }
  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
        quiz.name === name;
    }
  }
    return {};
}
export { adminQuizNameUpdate};


function doesQuizIdRefer(quizId, authUserId) {
    let is_valid = False; 
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
    return False;
}

function isQuizIdValid(quizId) {
  let is_valid = False; 
  const data =  getData();
  for (let quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
        return true;  
    }
  }
  return false;
}


function adminQuizList(authUserId) {
  return {
    quizzes: {quizId: 1, 
    name: 'My Quiz'}
  };
}

export { adminQuizList };

function adminQuizRemove(authUserId, quizId) {
  return {};
}

export { adminQuizRemove };


function adminQuizDescriptionUpdate(authUserId, quizId, description) {

  const isAuthUserIdValidTest = isAuthUserIdValid(data, authUserId);
  const data = getData();

  if (!isAuthUserIdValidTest) {
    return { error: "AuthUserId is not a valid user" };
  }

  if (!isQuizIdValid(quizId)) {
    return { error: "quizId does not refer to a valid quiz."};
  }

  if (!doesQuizIdRefer(quizId, authUserId)) {
    return {error: "Quiz ID does not refer to a quiz that this user owns"};
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

  return { };

}

export { adminQuizDescriptionUpdate };

// HELPER FUNCTIONS - START ------------------------------------------------------------------------

/**
 * Function to test whether authUserId is valid
 * Used in:
 * adminQuizCreate()
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
  const regexAlpha = /[a-z]/gim;
  const regexNum = /[\d]/gim;
  const regexAllSpaces = /^[\s]+$/gim;

  const regexMainTest = regexMain.test(name);
  const regexAlphaTest = regexAlpha.test(name);
  const regexNumTest = regexNum.test(name);
  const regexAllSpacesTest = regexAllSpaces.test(name);

  if (
    !(regexMainTest && regexAlphaTest && regexNumTest && !regexAllSpacesTest)
  ) {
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
