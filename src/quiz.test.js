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
  