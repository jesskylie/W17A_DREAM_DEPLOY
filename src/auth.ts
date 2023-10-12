import { getData, setData } from './dataStore';
import isEmail from 'validator/lib/isEmail.js';

/**
 * Returns details about the user, given their authUserId
 * Successful login starts at 1 at user registration
 * Number of failed logins is reset every time they have a successful login
 *
 * @param {number} email - user's email
 * @returns {{user: {userId: number, name: string, email: string, numSuccessfulLogins: number
 *            numFailedPasswordsSinceLastLogin: number}}} - user details
 * @returns {{error: string}} - on error
 */
export function adminUserDetails(authUserId) {
  let data = getData();
  for (let user of data.users) {
    if (user.authUserId === authUserId) {
      return {
        user: {
          userId: user.authUserId,
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
 * @returns {{authUserId: number}} - unique identifier for a user
 * @returns {{error: string}} - on error
 */
export function adminAuthRegister(email, password, nameFirst, nameLast) {
  let data = getData();

  //email address is already in use
  if (data.users.length >= 1) {
    for (let pass of data.users) {
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

  const length = data.users.length;
  //authUserId will be index from 0,1,2,3....
  if (length === 0) {
    data.users.authUserId = 0;
  } else {
    data.users.authUserId = data.users[length - 1].authUserId + 1;
  }

  data.users.push({
    authUserId: data.users.authUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    quizId: [],
  });

  setData(data);

  return {
    authUserId: data.users.authUserId,
  };
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
export function adminAuthLogin(email, password) {
  // implemented by Paul 29Sep23
  let data = getData();

  // test for email exists
  let emailExistsBool = false;
  for (let arr of data.users) {
    if (arr.email === email) {
      emailExistsBool = true;
    }
  }

  if (!emailExistsBool) {
    return { error: 'Email address does not exist' };
  }

  // test for correct password
  let passwordIsCorrectBool = false;
  for (let arr of data.users) {
    if (arr.password === password) {
      passwordIsCorrectBool = true;
    }
  }

  //increments failed login attempts
  if (!passwordIsCorrectBool) {
    for (let arr of data.users) {
      if (arr.email === email && arr.password !== password) {
        arr.numFailedPasswordsSinceLastLogin++;
        return { error: 'Password is not correct for the given email' };
      }
    }
  }

  // return authUserId of logged in user
  // as email exists && password matches
  //increments successful login, numFailed login resets to 0
  let authUserId;
  for (let arr of data.users) {
    if (arr.email === email && arr.password === password) {
      authUserId = arr.authUserId;
      arr.numSuccessfulLogins++;
      arr.numFailedPasswordsSinceLastLogin = 0;
    }
  }

  setData(data);

  return {
    authUserId: authUserId,
  };
}

// Helper functions

/**
 * checks that a name is between 2-20 characters and only contains characters
 * code taken from https://bobbyhadz.com/blog/javascript-check-if-string-contains-only-letters-and-numbers
 * @param {string} name - user's name
 * @returns {bool} true - returns true if name fits criteria
 * @returns {bool} false - returns false if name does not fit criteria
 */
function isValidName(name) {
  //must only include chars, spaces and hyphens
  const correctName = /^[a-zA-Z\s\-']+$/;
  if (name.length >= 2 && name.length <= 20) {
    return correctName.test(name);
  } else {
    return false;
  }
}

/**
 * checks that password is at least 8 characters & contains at least 1 number and 1 letter
 * code taken from https://stackoverflow.com/questions/7075254/how-to-validate-a-string-which-contains-at-least-one-letter-and-one-digit-in-jav
 * @param {string} password - user's password
 * @returns {bool} true - returns true if name fits criteria
 * @returns {bool} false - returns false if name does not fit criteria
 */
function isValidPassword(password) {
  //must include at least 1 number and 1 letter
  const correctPassword = /^(?=.*[0-9])(?=.*[a-zA-Z])/;
  if (password.length >= 8) {
    return correctPassword.test(password);
  } else {
    return false;
  }
}
