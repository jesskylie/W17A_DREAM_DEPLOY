import {
    adminQuizList,
    adminQuizCreate,
    adminQuizRemove,
    adminQuizInfo,
    adminQuizNameUpdate,
    adminQuizDescriptionUpdate,
  } from './quiz.js';

import { clear } from './other.js';

beforeEach(() => {
    clear();
});


describe ('Testing adminQuizRemove', () => {
    test('Correct input', () => {
        const NewUser = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        const QuizId = adminQuizCreate(NewUser, 'Jess', 'description');
        expect(adminQuizRemove(NewUser, QuizId)).toStrictEqual({});
    });
    
    test ('Empty input', () => {
        expect(adminQuizRemove('', '')).toStrictEqual({ error: expect.any(String) });
    });
    
    test ('Invalid AuthUserId', () => {
        const NewUser = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        const QuizId = adminQuizCreate(NewUser, 'Jess', 'description');
        expect(adminQuizRemove('abc', QuizId)).toStrictEqual({ error: expect.any(String) });
    });
    
    test ('Invalid QuizId', () => {
        const NewUser = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        const QuizId = adminQuizCreate(NewUser, 'Jess', 'description');
        expect(adminQuizRemove(NewUser, 'abc')).toStrictEqual({ error: expect.any(String) });
    });
    
    test ('QuizId does not refer to a quiz that this user owns', () => {
        const JessUser = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        const AdamUser = adminAuthRegister('adam@hotmail.com', 'ab123456', 'Adam', 'Lee');
        const JessQuizId = adminQuizCreate(NewUser, 'Jess', 'description');
        const AdamQuizId = adminQuizCreate(NewUser, 'Jess', 'description');
        expect(adminQuizRemove(JessUser, AdamQuizId)).toStrictEqual({ error: expect.any(String) });
    });    
});

describe('Testing adminQuizCreate', () => {
    test('Test Valid Auth User ID', () => {
      const authUserId = adminAuthRegister(email, password, nameFirst, nameLast);
      const quizId = adminQuizCreate(authUserId, 'Saarthak', description);
      expect(quizId).toStrictEqual({quizId: expect.any(Number)});
    });
   
    test('Test Invalid Auth User ID', () => {
      const authUserId = adminAuthRegister(email, password, nameFirst, nameLast);
      const quizId = adminQuizCreate('111111', 'Saarthak', description);
      expect(quizId).toStrictEqual({error: expect.any(String)});
      });
    
    test('Test Valid Name', () => {
      const authUserId = adminAuthRegister(email, password, nameFirst, nameLast);
      const quizId = adminQuizCreate(authUserId, 'Saarthak', description);
        expect(quizId).toStrictEqual({quizId: expect.any(Number)});
      });
    
      test('Test Invalid Name', () => {
        const authUserId = adminAuthRegister(email, password, nameFirst, nameLast);
        const quizId = adminQuizCreate(authUserId, '???!!!', description);
        expect(quizId).toStrictEqual({error: expect.any(String)});
      });

      test('Test Invalid Samll Name Size', () => {
        const authUserId = adminAuthRegister(email, password, nameFirst, nameLast);
        const quizId = adminQuizCreate(authUserId, 'ai', description);
        expect(quizId).toStrictEqual({error: expect.any(String)});
      });
      
      test('Test Invalid Large Name Size', () => {
        const authUserId = adminAuthRegister(email, password, nameFirst, nameLast);
        const quizId = adminQuizCreate(authUserId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', description);
        expect(quizId).toStrictEqual({error: expect.any(String)});
      });

      test('Test Invalid Repeated Name', () => {
        const authUserId = adminAuthRegister(email, password, nameFirst, nameLast);
        const quizId = adminQuizCreate(authUserId, 'Saarthak', description);
        const quizId2 = adminQuizCreate(authUserId, 'Saarthak', description);
        expect(quizId2).toStrictEqual({error: expect.any(String)});
      });
    
      test('Test Valid Description', () => {
        const authUserId = adminAuthRegister(email, password, nameFirst, nameLast);
        const quizId = adminQuizCreate(authUserId, 'Saarthak', '');
        expect(quizId).toStrictEqual({quizId: expect.any(Number)});
      });

      test('Test Invalid Description', () => {
        const authUserId = adminAuthRegister(email, password, nameFirst, nameLast);
        const quizId = adminQuizCreate(authUserId, 'Saarthak', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        expect(quizId).toStrictEqual({error: expect.any(String)});
      });
});

  