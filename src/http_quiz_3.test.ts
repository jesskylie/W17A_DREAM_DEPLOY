import HTTPError from 'http-errors';
import {
  requestAdminQuizCreateV2,
  requestAdminRegister,
  requestClear,
  requestAdminQuizRemoveV2,
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

describe('Testing /v2/admin/quiz', () => {
  test('Send a quiz to trash', () => {
    requestClear();
    const result = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(result.body.token, 'QuizOne', 'Quiz description');
    requestAdminQuizCreateV2(result.body.token, 'QuizTwo', 'Quiz description');
    expect(requestAdminQuizRemoveV2(result.body.token, quizId.quizId)).toStrictEqual({});
  });
	
	test('Token is empty or invalid - error 401', () => {
    requestClear();
    const result = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(result.body.token, 'QuizOne', 'Quiz description');
    requestAdminQuizCreateV2(result.body.token, 'QuizTwo', 'Quiz description');
		
		console.log(requestAdminQuizRemoveV2('', quizId.quizId));
    expect(() => requestAdminQuizRemoveV2('', quizId.quizId)).toThrow(HTTPError[401]);
		expect(() => requestAdminQuizRemoveV2('abcde', quizId.quizId)).toThrow(HTTPError[401]);
  });
	
	test('Valid token is provided but user is not owner of quiz - error 403', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
		const userTwo = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    requestAdminQuizCreateV2(userOne.body.token, 'QuizTwo', 'Quiz description');
		const result = requestAdminQuizRemoveV2(userTwo.body.token, quizId.quizId);
		console.log(result);
    expect(() => requestAdminQuizRemoveV2(userTwo.body.token, quizId.quizId)).toThrow(HTTPError[403]);
  });
});
