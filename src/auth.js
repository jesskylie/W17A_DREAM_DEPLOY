import { getData, setData } from "./dataStore.js";
import isEmail from "validator/lib/isEmail.js";

export function adminUserDetails(authUserId) {
  return {
    user: {
      userId: 1,
      name: "Hayden Smith",
      email: "hayden.smith@unsw.edu.au",
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
    },
  };
}

export function adminAuthRegister(email, password, nameFirst, nameLast) {
  let data = getData();

  //email address is already in use
  if (data.users.length > 1) {
    for (let pass of data.users) {
      if (pass.email === email) {
        return { error: "Email is already in use" };
      }
    }
  }

  if (!isEmail(email)) {
    return { error: "Invalid email address" };
  }

  if (!isValidName(nameFirst) || !isValidName(nameLast)) {
    return { error: "Invalid first name or last name" };
  }

  if (!isValidPassword(password)) {
    return { error: "Password length is less than 8 characters" };
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
    numSuccessfulLogins: 0,
    numFailedPasswordsSinceLastLogin: 0,
    quizId: [],
  });

  setData(data);

  return {
    authUserId: data.users.authUserId,
  };
}

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
    return { error: "Email address does not exist" };
  }

  // test for correct password
  let passwordIsCorrectBool = false;
  for (let arr of data.users) {
    if (arr.password === password) {
      passwordIsCorrectBool = true;
    }
  }

  if (!passwordIsCorrectBool) {
    return { error: "Password is not correct for the given email" };
  }

  // return authUserId of logged in user
  // as email exists && password matches
  let authUserId;
  for (let arr of data.users) {
    if (arr.email === email && arr.password === password) {
      authUserId = arr.authUserId;
    }
  }

  return {
    authUserId: authUserId,
  };
}

// Helper functions

//checks that a name is between 2-20 characters and only contains characters
//returns true if it fits the criteria, false otherwise
//code taken from https://bobbyhadz.com/blog/javascript-check-if-string-contains-only-letters-and-numbers
function isValidName(name) {
  //must only include chars, spaces and hyphens
  const correctName = /^[a-zA-Z\s\-']+$/;

  if (name.length >= 2 && name.length <= 20) {
    return correctName.test(name);
  } else {
    return false;
  }
}

//checks that password is at least 8 characters & contains at least 1 number and 1 letter
//returns true for valid password, returns false otherwise
//code taken from https://stackoverflow.com/questions/7075254/how-to-validate-a-string-which-contains-at-least-one-letter-and-one-digit-in-jav
function isValidPassword(password) {
  //must include at least 1 number and 1 letter
  const correctPassword = /^(?=.*[0-9])(?=.*[a-zA-Z])/;
  if (password.length >= 8) {
    return correctPassword.test(password);
  } else {
    return false;
  }
}
