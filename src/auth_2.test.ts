// Do not delete this file
import request from 'sync-request-curl';
import config from './config.json';
import { adminAuthRegister, adminUserDetails } from './auth';

const OK = 200;
const INPUT_ERROR = 400;
const port = config.port;
const url = config.url;

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

function requestAdminRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST', 
    url + ':' + port + '/v1/admin/auth/register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    } 
  );
  return JSON.parse(res.body.toString());
}

describe ('Testing POST /v1/admin/auth/register', () => {
  test('Test successful adminAuthRegister', () => {
    const result = {
      token: expect.any(Number)
    };
    expect(requestAdminRegister('abc@hotmail.com', 'abcde42342', 'Arnold', 'Big')).toStrictEqual(result);
  });
  
  test('Test unsuccessful adminAuthRegister', () => {
    expect(requestAdminRegister('', 'abcde42342', 'Arnold', 'Big')).toStrictEqual({ error: expect.any(String) });
    expect(requestAdminRegister('abc@hotmail.com', '', 'Arnold', 'Big')).toStrictEqual({ error: expect.any(String) });
    expect(requestAdminRegister('', 'abcde42342', '', 'Big')).toStrictEqual({ error: expect.any(String) });
    expect(requestAdminRegister('abc@hotmail.com', 'abcde42342', 'Arnold', '')).toStrictEqual({ error: expect.any(String) });
    expect(requestAdminRegister('abc@hotmail.com', 'abcd', 'Arnold', 'Lee')).toStrictEqual({ error: expect.any(String) });
  });
});

function requestUserDetails(token: number) {
  const res = request(
    'POST', 
    url + ':' + port + `/v1/admin/user/details?token=${token}`,
    {
      qs: {
        token: token,
      }
    }
  );
  return JSON.parse(res.body.toString());
}


