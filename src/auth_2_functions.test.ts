// This is a test message for pull everything in testMaster to local vscode
// New tests for functions for iteration 2
import { adminAuthRegister, updatePassword } from './auth';

import { newClear } from './other';

interface TokenString {
  token: string;
}

beforeEach(() => {
  newClear();
});

describe('Testing update password', () => {
  test('Old password does not match old password', () => {
    const newUser = adminAuthRegister(
      'jake@hotmail.com',
      'password1234',
      'Jake',
      'Garry'
    ) as TokenString;
    const result = updatePassword(
      newUser.token,
      'password123456',
      'helloworld123'
    );
    expect(result).toStrictEqual({ error: expect.any(String), errorCode: 400 });
  });

  test('New password and old password match exactly', () => {
    const newUser = adminAuthRegister(
      'jake@hotmail.com',
      'password1234',
      'Jake',
      'Garry'
    ) as TokenString;
    const result = updatePassword(
      newUser.token,
      'password1234',
      'password1234'
    );
    expect(result).toStrictEqual({ error: expect.any(String), errorCode: 400 });
  });

  test('New password has already been used before by this user', () => {
    const newUser = adminAuthRegister(
      'jake@hotmail.com',
      'password1234',
      'Jake',
      'Garry'
    ) as TokenString;
    updatePassword(newUser.token, 'password1234', 'hello123456');
    const result = updatePassword(newUser.token, 'password1234', 'hello123456');
    expect(result).toStrictEqual({ error: expect.any(String), errorCode: 400 });
  });

  test('Invalid new password', () => {
    const newUser = adminAuthRegister(
      'jake@hotmail.com',
      'password1234',
      'Jake',
      'Garry'
    ) as TokenString;
    const result = updatePassword(newUser.token, 'password', 'password1234');
    expect(result).toStrictEqual({ error: expect.any(String), errorCode: 400 });
  });

  test('Successfully updated new password', () => {
    const newUser = adminAuthRegister(
      'jake@hotmail.com',
      'password1234',
      'Jake',
      'Garry'
    ) as TokenString;
    const result = updatePassword(
      newUser.token,
      'password1234',
      'hello1234567'
    );
    expect(result).toStrictEqual({});
  });

  test('Token is invalid ', () => {
    adminAuthRegister(
      'jake@hotmail.com',
      'password1234',
      'Jake',
      'Garry'
    ) as TokenString;
    const result = updatePassword('abc', 'hello1234567', 'password1234');
    expect(result).toStrictEqual({ error: expect.any(String), errorCode: 401 });
  });
});
