import { TokenClass } from 'typescript';
import { getData, setData, DataStore } from './dataStore';
import isEmail from 'validator/lib/isEmail.js';
import { retrieveDataFromFile, saveDataInFile } from './functions';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

const MAX_NAME_LENGTH = 20;
const MIN_NAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;
const MAX = 1000;
const MIN = 10000;

// TypeScript interfaces - START
interface AuthUserId {
  authUserId: number;
}

interface Token {
  token: number[];
}

interface TokenNumber {
  token: number;
}

interface ErrorObject {
  error: string;
}

interface UserInfo {
  user: {
    authUserId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };
}

interface UserData {
  authUserId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  quizId: number[];
  token: number[];
}
// TypeScript interfaces - END

/**
 * Returns details about the user, given their authUserId
 * Successful login starts at 1 at user registration
 * Number of failed logins is reset every time they have a successful login
 *
 * @param {number} authUserId - users authUserId
 * @returns {{user: {userId: number, name: string, email: string, numSuccessfulLogins: number
 *            numFailedPasswordsSinceLastLogin: number}}} - user details
 * @returns {{error: string}} - on error
 */
export function adminUserDetails(token: number): UserInfo | ErrorObject {
  const data = getData();
  for (const user of data.users) {
    if (user.token.includes(token)) {
      return {
        user: {
          authUserId: user.authUserId,
          name: user.nameFirst + ' ' + user.nameLast,
          email: user.email,
          numSuccessfulLogins: user.numSuccessfulLogins,
          numFailedPasswordsSinceLastLogin:
            user.numFailedPasswordsSinceLastLogin,
        },
      };
    }
  }
  setData(data);
  return { error: 'Invalid UserId' };
}

/**
 * Registers a user with their email, password, name and returns their authUserId value
 * Returns an error if email is invalid/is already in use, name/password does not satisfy criteria
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast- user's last name
 * @returns {{token: number}} - unique identifier for a user
 * @returns {{error: string}} - on error
 */

export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): TokenNumber | ErrorObject {
  // const data = getData();

  // Iteration 2: New data retrieval system - START
  const data: DataStore = retrieveDataFromFile();
  // Iteration 2: New data retrieval system - END

  //email address is already in use
  if (data.users.length >= 1) {
    for (const pass of data.users) {
      if (pass.email === email) {
        return { error: 'Email is already in use' };
      }
    }
  }

  if (!isEmail(email)) {
    return { error: 'Invalid email address' };
  }

  if (!isValidName(nameFirst) || !isValidName(nameLast)) {
    return { error: 'Invalid first name or last name' };
  }

  if (!isValidPassword(password)) {
    return { error: 'Invalid password' };
  }

  const newUser: UserData = {
    authUserId: data.users.length,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    quizId: [],
    token: [],
  };
  data.users.push(newUser);
  const tokenNumber = generateToken();
  newUser.token.push(tokenNumber);

  // Iteration 2: New data save system - START
  saveDataInFile(data);
  // Iteration 2: New data save system - END

  // setData(data);

  return { token: tokenNumber };
}

/**
 * Returns a users authUserId, given a registered user's email and password
 * Returns an error if email is invalid/is already in use, name/password does not satisfy criteria
 * Updates successful/unsuccessful logins with each admin login call
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 * @returns {{authUserId: number}} - unique identifier for a user
 * @returns {{error: string}} - on error
 */
export function adminAuthLogin(
  email: string,
  password: string
): TokenNumber | ErrorObject {
  // implemented by Paul 29Sep23
  // const data = getData();

  // Iteration 2: New data retrieval system - START
  const data: DataStore = retrieveDataFromFile();
  // Iteration 2: New data retrieval system - END

  // test for email exists
  let emailExistsBool = false;
  for (const arr of data.users) {
    if (arr.email === email) {
      emailExistsBool = true;
    }
  }

  if (!emailExistsBool) {
    return { error: 'Email address does not exist' };
  }

  // test for correct password
  let passwordIsCorrectBool = false;
  for (const arr of data.users) {
    if (arr.password === password) {
      passwordIsCorrectBool = true;
    }
  }

  // increments failed login attempts
  if (!passwordIsCorrectBool) {
    for (const arr of data.users) {
      if (arr.email === email && arr.password !== password) {
        arr.numFailedPasswordsSinceLastLogin++;
        return { error: 'Password is not correct for the given email' };
      }
    }
  }

  // return authUserId of logged in user
  // as email exists && password matches
  // increments successful login, numFailed login resets to 0
  let token;
  for (const arr of data.users) {
    if (arr.email === email && arr.password === password) {
      console.log('arr ->', arr);
      token = arr.token[0];
      arr.numSuccessfulLogins++;
      arr.numFailedPasswordsSinceLastLogin = 0;
    }
  }

  // Iteration 2: New data save system - START
  saveDataInFile(data);
  // Iteration 2: New data save system - END

  // setData(data);

  return {
    token: token,
  };
}

// Helper functions

/**
 * checks that a name is between 2-20 characters and only contains characters
 * code taken from https://bobbyhadz.com/blog/javascript-check-if-string-contains-only-letters-and-numbers
 * @param {string} name - user's name
 * @returns {boolean} true - returns true if name fits criteria
 * @returns {boolean} false - returns false if name does not fit criteria
 */
function isValidName(name: string): boolean {
  // must only include chars, spaces and hyphens
  const correctName = /^[a-zA-Z\s\-']+$/;
  if (name.length >= MIN_NAME_LENGTH && name.length <= MAX_NAME_LENGTH) {
    return correctName.test(name);
  } else {
    return false;
  }
}

/**
 * checks that password is at least 8 characters & contains at least 1 number and 1 letter
 * code taken from https://stackoverflow.com/questions/7075254/how-to-validate-a-string-which-contains-at-least-one-letter-and-one-digit-in-jav
 * @param {string} password - user's password
 * @returns {boolean} true - returns true if name fits criteria
 * @returns {boolean} false - returns false if name does not fit criteria
 */
function isValidPassword(password: string): boolean {
  // must include at least 1 number and 1 letter
  const correctPassword = /^(?=.*[0-9])(?=.*[a-zA-Z])/;
  if (password.length >= MIN_PASSWORD_LENGTH) {
    return correctPassword.test(password);
  } else {
    return false;
  }
}

/**
 * generates random number for a token between 1000 - 10000
 * code taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * @param {}
 * @returns {number} - returns a random token number 

 */
function generateToken(): number {
  return Math.floor(Math.random() * (MAX - MIN)) + MIN;
}
