import HTTPError from 'http-errors';
import {
  requestAdminQuizCreateV2,
  requestAdminRegister,
  requestClear,
} from './library/route_testing_functions';

describe('Testing /v2/admin/quiz', () => {
  test('Success - valid input', () => {
    requestClear();
    const result = requestAdminRegister(
      'jess@hotmail.com',
      '12345abced',
      'Jess',
      'Tran'
    );
    expect(
      requestAdminQuizCreateV2(
        result.body.token,
        'New Quiz',
        'Quiz description'
      )
    ).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Token is empty or invalid - error 401 ', () => {
    requestClear();
    requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    expect(() =>
      requestAdminQuizCreateV2('', 'New Quiz', 'Quiz description')
    ).toThrow(HTTPError[401]);
  });

  test('Name contains invalid characters - error 400 ', () => {
    requestClear();
    const result = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    expect(() => requestAdminQuizCreateV2(result.body.token, '$$$$', 'Quiz description')).toThrow(HTTPError[400]);
  });

  test('Name is less than not between 3 - 30 characters long - error 400 ', () => {
    requestClear();
    const result = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    expect(() => requestAdminQuizCreateV2(result.body.token, 'A', 'Quiz description')).toThrow(HTTPError[400]);
    expect(() =>
      requestAdminQuizCreateV2(result.body.token, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'Quiz description')).toThrow(HTTPError[400]);
  });

  test('Name is already used by the current logged in user for another quiz ', () => {
    requestClear();
    const result = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    requestAdminQuizCreateV2(result.body.token, 'QuizOne', 'Quiz description');
    expect(() => requestAdminQuizCreateV2(result.body.token, 'QuizOne', 'description')).toThrow(HTTPError[400]);
  });

  test('Name is already used by the current logged in user for another quiz ', () => {
    requestClear();
    const result = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    requestAdminQuizCreateV2(result.body.token, 'QuizOne', 'Quiz description');
    expect(() => requestAdminQuizCreateV2(result.body.token, 'QuizOne', 'description')).toThrow(HTTPError[400]);
  });
});
