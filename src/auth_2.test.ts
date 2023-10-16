// Do not delete this file
import request from 'sync-request-curl';
import config from './config.json';

// constants used throughout file - START

const OK = 200;
const INPUT_ERROR = 400;
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
    expect(res.statusCode).toBe(OK);
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
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
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
    expect(responsePOST.statusCode).toStrictEqual(OK);
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
    expect(responsePOST.statusCode).toStrictEqual(INPUT_ERROR);
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
    expect(responsePOST.statusCode).toStrictEqual(INPUT_ERROR);
  });
});

// Test suite for /v1/admin/auth/login route adminAuthLogin() - END
