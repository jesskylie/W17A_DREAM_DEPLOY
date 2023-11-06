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

  test('Token is empty or invalid ', () => {
    requestClear();
    requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    expect(() =>
      requestAdminQuizCreateV2('', 'New Quiz', 'Quiz description')
    ).toThrow(HTTPError[401]);
  });
});
