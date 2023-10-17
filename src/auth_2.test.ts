// Do not delete this file
import request from 'sync-request-curl';
import config from './config.json';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// constants used throughout file - END

// interfaces used throughout file - START

interface ErrorObject {
  error: string;
}

// interfaces used throughout file - END

// Functions to execute before each test is run - START
beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { json: {} });
});

// Functions to execute before each test is run - END

describe('HTTP tests using Jest', () => {
  test('Test successful echo', () => {
    const res = request('GET', `${url}:${port}/echo`, {
      qs: {
        echo: 'Hello',
      },
      // adding a timeout will help you spot when your server hangs
      timeout: 100,
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(RESPONSE_OK_200);
    expect(bodyObj.value).toEqual('Hello');
  });
  test('Test invalid echo', () => {
    const res = request('GET', `${url}:${port}/echo`, {
      qs: {
        echo: 'echo',
      },
      timeout: 100,
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(RESPONSE_ERROR_400);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

function requestAdminRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST', 
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    } 
    
  );
  return {
    body: JSON.parse(res.body.toString()),
    status: res.statusCode
  }
}

describe ('Testing POST /v1/admin/auth/register - SUCCESS', () => {
  test('Test successful adminAuthRegister', () => {
    const response = requestAdminRegister('abc@hotmail.com', 'abcde4284', 'Ann', 'Pie');
    expect(response.body).toStrictEqual({ token: expect.any(Array<Number>) });
    
    expect(response.status).toStrictEqual(RESPONSE_OK_200);
  });
});

describe ('Testing POST /v1/admin/auth/register - UNSUCCESSFUL', () => {
  test('Email does not satisfy validator.isEmail', () => {
    const response = requestAdminRegister('invalid-email', 'adheh38753', 'Pea', 'Nut');
    expect(response.body).toStrictEqual( {error: expect.any(String)} );
    expect(response.status).toStrictEqual(RESPONSE_ERROR_400);
  });
  
  test('Email is already in use by another user', () => {
    requestAdminRegister('jess@hotmail.com', '123456abce', 'Pea', 'Nut');
    const response = requestAdminRegister('jess@hotmail.com', '123456abce', 'Jess', 'Tee');
    expect(response.body).toStrictEqual( {error: expect.any(String)} );
    expect(response.status).toStrictEqual(RESPONSE_ERROR_400);
  });
  
  test('Name contains invalid characters', () => {
    const invalidFirstName = requestAdminRegister('harry@hotmail.com', '123456abce', 'har%%$@#%', 'Tee');
    const invalidLastName = requestAdminRegister('harry@hotmail.com', '123456abce', 'harry', 'Tee#$%*%');
    expect(invalidFirstName.body).toStrictEqual( {error: expect.any(String)} );
    expect(invalidLastName.body).toStrictEqual( {error: expect.any(String)} );
    expect(invalidFirstName.status).toStrictEqual(RESPONSE_ERROR_400);
    expect(invalidLastName.status).toStrictEqual(RESPONSE_ERROR_400);
  });
  
  test('Name is not between 2 to 20 characters', () => {
    const response = requestAdminRegister('abc@hotmail.com', 'abcde4284', 'A', 'Pie');
    const responseTwo = requestAdminRegister('abc@hotmail.com', 'abcde4284', 'Amy', 'P');
    expect(response.body).toStrictEqual( {error: expect.any(String)} );
    expect(responseTwo.body).toStrictEqual( {error: expect.any(String)} );
    expect(response.status).toStrictEqual(RESPONSE_ERROR_400);
    expect(responseTwo.status).toStrictEqual(RESPONSE_ERROR_400);
  });
  
  test('Password is less than 8 characters', () => {
    const response= requestAdminRegister('harry@hotmail.com', '12345', 'harry', 'Tee');
    expect(response.body).toStrictEqual( {error: expect.any(String)} );
    expect(response.status).toStrictEqual(RESPONSE_ERROR_400);
  });
  
  test('Password is less than 8 characters', () => {
    const response = requestAdminRegister('harry@hotmail.com', '12345', 'harry', 'Tee');
    expect(response.body).toStrictEqual( {error: expect.any(String)} );
    expect(response.status).toStrictEqual(RESPONSE_ERROR_400);
  });
  
  test('Password does not contain at least 1 number and 1 letter', () => {
    const response = requestAdminRegister('harry@hotmail.com', '12345689', 'harry', 'Tee');
    expect(response.body).toStrictEqual( {error: expect.any(String)} );
    expect(response.status).toStrictEqual(RESPONSE_ERROR_400);
  });
});

function requestUserDetails(token: number) {
  const res = request(
    'GET', 
    SERVER_URL + '/v1/admin/user/details',
    {
      qs: {
        token: token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    status: res.statusCode
  }
}

describe ('Testing GET /v1/admin/user/details - SUCCESS', () => {
  test('Test successful adminUserDetails', () => {
    const response = requestAdminRegister('kayla@hotmail.com', 'abcde4284', 'Ann', 'Pie');
    const userDetails = requestUserDetails(response.body);
    expect(userDetails.body).toStrictEqual({ 
      user: {
        authUserId: 0,
        name: 'Ann Pie',
        email: 'kayla@hotmail.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }, 
    });
    expect(userDetails.status).toStrictEqual(RESPONSE_OK_200);
  });
  
  test('Testing unsuccessful adminUserDetails', () => {
    const response = requestUserDetails(-1);
    expect(response.body).toStrictEqual({error: expect.any(String)});
    expect(response.status).toStrictEqual(RESPONSE_ERROR_401);
  });
});


// Test suite for /v1/admin/auth/login route adminAuthLogin() - START

// From swagger.yaml file:
// Takes in information about an admin user to determine
// if they can log in to manage quizzes. This route is
// not relevant to guests who want to play a particular
// quiz, but is used for the creation of accounts of
// people who manage quizzes.

// Function to poll route
// Returns the body of the response as a JSON object

interface PersonLoginReturn {
  token: number;
}

const requestPersonLogin = (
  email: string,
  password: string
): PersonLoginReturn | ErrorObject => {
  const res = request('POST', SERVER_URL + 'v1/admin/auth/login', {
    json: { email, password },
  });

  return JSON.parse(res.body.toString());
};

// Tests
describe('test /v1/admin/auth/login -> EXPECT SUCCESS', () => {
  const email = 'paulemail@gmail.com';
  const password = 'password123456789';
  test('Test successfully logging in person return type', () => {
    expect(requestPersonLogin(email, password)).toStrictEqual({
      token: expect.any(Number),
    });
  });
  test('Test successfully logging in person return status code 200', () => {
    const responsePOST = request('POST', SERVER_URL + 'v1/admin/auth/login', {
      json: { email, password },
    });
    expect(responsePOST.statusCode).toStrictEqual(RESPONSE_OK_200);
  });
});

describe('test /v1/admin/auth/login -> EXPECT ERROR', () => {
  // Email address does not exist
  const email = 'thisemaildoesnotexist@gmail.com';
  const password = 'password123456789';
  test('/v1/admin/auth/login : Email address does not exist -> EXPECT ERROR', () => {
    expect(requestPersonLogin(email, password)).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Test unsuccessfully logging in person return status code 400', () => {
    const responsePOST = request('POST', SERVER_URL + 'v1/admin/auth/login', {
      json: { email, password },
    });
    expect(responsePOST.statusCode).toStrictEqual(RESPONSE_ERROR_400);
  });

  // Password is not correct for the given email
  const email_2 = 'paulsemail@gmail.com';
  const password_2 = '';
  test('/v1/admin/auth/login : Password is not correct for the given email -> EXPECT ERROR', () => {
    expect(requestPersonLogin(email_2, password_2)).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Test unsuccessfully logging in person return status code 400', () => {
    const responsePOST = request('POST', SERVER_URL + 'v1/admin/auth/login', {
      json: { email_2, password_2 },
    });
    expect(responsePOST.statusCode).toStrictEqual(RESPONSE_ERROR_400);
  });
});

// Test suite for /v1/admin/auth/login route adminAuthLogin() - END
