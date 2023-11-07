import HTTPError from 'http-errors';
import {
  requestAdminQuizCreateV2,
  requestAdminRegister,
  requestClear,
  requestAdminQuizRemoveV2,
  requestAdminQuizInfoV2,
  requestUpdateQuizNameV2,
  requestAdminQuizDescriptionUpdateV2,
} from './library/route_testing_functions';

describe('Testing POST /v2/admin/quiz', () => {
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

describe('Testing DELETE /v2/admin/quiz', () => {
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
    expect(() => requestAdminQuizRemoveV2('', quizId.quizId)).toThrow(HTTPError[401]);
    expect(() => requestAdminQuizRemoveV2('abcde', quizId.quizId)).toThrow(HTTPError[401]);
  });

  test('Valid token is provided but user is not owner of quiz - error 403', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const userTwo = requestAdminRegister('katie@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    requestAdminQuizCreateV2(userOne.body.token, 'QuizTwo', 'Quiz description');
    expect(() => requestAdminQuizRemoveV2(userTwo.body.token, quizId.quizId)).toThrow(HTTPError[403]);
  });
});

describe('Testing GET /v2/admin/quiz/:quizid', () => {
  test('Successfully displays current quiz', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    const returnObject = {
      quizId: quizId.quizId,
      duration: 0,
      name: 'QuizOne',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Quiz description',
      numQuestions: 0,
      questions: expect.arrayContaining([]),
    };
    expect(requestAdminQuizInfoV2(userOne.body.token, quizId.quizId)).toStrictEqual(returnObject);
  });
  test('Token is empty/invalid - 400 error', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    expect(() => requestAdminQuizInfoV2('', quizId.quizId)).toThrow(HTTPError[401]);
    expect(() => requestAdminQuizInfoV2('abcdef', quizId.quizId)).toThrow(HTTPError[401]);
  });
  test('Valid token is provided but user is not owner of quiz - error 403', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const userTwo = requestAdminRegister('katie@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    requestAdminQuizCreateV2(userOne.body.token, 'QuizTwo', 'Quiz description');
    expect(() => requestAdminQuizInfoV2(userTwo.body.token, quizId.quizId)).toThrow(HTTPError[403]);
  });
});

describe('Testing PUT /v2/admin/quiz/:quizid/name', () => {
  test('Success name update', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    expect(requestUpdateQuizNameV2(userOne.body.token, quizId.quizId, 'New Name')).toStrictEqual({});
  });
  test('Testing name contains invalid characters - 400 error', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    expect(() => requestUpdateQuizNameV2(userOne.body.token, quizId.quizId, '$$$$$$$e')).toThrow(HTTPError[400]);
  });
  test('Testing name not between 3 and 30 characters - 400 error', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    expect(() => requestUpdateQuizNameV2(userOne.body.token, quizId.quizId, 'a')).toThrow(HTTPError[400]);
    expect(() => requestUpdateQuizNameV2(userOne.body.token, quizId.quizId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toThrow(HTTPError[400]);
  });
  test('Testing name is already used for another quiz - 400 error', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    expect(() => requestUpdateQuizNameV2(userOne.body.token, quizId.quizId, 'QuizOne')).toThrow(HTTPError[400]);
  });

  test('Token is empty/invalid - 400 error', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    expect(() => requestUpdateQuizNameV2('', quizId.quizId, 'New Quiz Name')).toThrow(HTTPError[401]);
    expect(() => requestUpdateQuizNameV2('abcdef', quizId.quizId, 'New Quiz Name')).toThrow(HTTPError[401]);
  });
  test('Valid token is provided but user is not owner of quiz - error 403', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const userTwo = requestAdminRegister('katie@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    requestAdminQuizCreateV2(userOne.body.token, 'QuizTwo', 'Quiz description');
    expect(() => requestUpdateQuizNameV2(userTwo.body.token, quizId.quizId, 'New Quiz Name')).toThrow(HTTPError[403]);
  });
});

describe.only('Testing PUT /v2/admin/quiz/:quizid/description', () => {
  test('Successfully updates quiz description name', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    expect(requestAdminQuizDescriptionUpdateV2(userOne.body.token, quizId.quizId, 'New Description Name')).toStrictEqual({});
  });
  test('Description is more than 100 characters - 400 error', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    expect(() => requestAdminQuizDescriptionUpdateV2(userOne.body.token, quizId.quizId, '1234567891011121314151617181920212324256272829303132333435636839465051525354556575859606162636465667689710')).toThrow(HTTPError[400]);
  });
  test('Token is empty/invalid - 401 error', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    expect(() => requestAdminQuizDescriptionUpdateV2('', quizId.quizId, 'New Quiz Name')).toThrow(HTTPError[401]);
    expect(() => requestAdminQuizDescriptionUpdateV2('abcdef', quizId.quizId, 'New Quiz Description')).toThrow(HTTPError[401]);
  });
  test('Valid token is provided but user is not owner of quiz - error 403', () => {
    requestClear();
    const userOne = requestAdminRegister('jess@hotmail.com', '12345abced', 'Jess', 'Tran');
    const userTwo = requestAdminRegister('katie@hotmail.com', '12345abced', 'Jess', 'Tran');
    const quizId = requestAdminQuizCreateV2(userOne.body.token, 'QuizOne', 'Quiz description');
    requestAdminQuizCreateV2(userOne.body.token, 'QuizTwo', 'Quiz description');
    expect(() => requestAdminQuizDescriptionUpdateV2(userTwo.body.token, quizId.quizId, 'New Quiz Description')).toThrow(HTTPError[403]);
  });
});
