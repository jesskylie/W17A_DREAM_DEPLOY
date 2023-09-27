import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails,
} from './auth.js';

import { adminQuizDescriptionUpdate } from './quiz.js'

import { clear } from './other.js';

beforeEach(() => {
    clear();
});


describe('Testing adminQuizDescriptionUpdate', () => {
    test('AuthUserId is not a valid user', () => {
        const testadminAuthLoginUserID = adminAuthLogin('jess@hotmail.com', '123456AB')
        expect(adminQuizDescriptionUpdate(testadminAuthLoginUserID)).toStrictEqual({ error: expect.any(String) });
    });

    test('Quiz ID does not refer to a valid quiz', () => {
        const testadminQuizID = adminQuizList(-1)
        expect(testadminQuizID).toStrictEqual({ error: expect.any(String) });
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
        const testadminQuizID = adminQuizList(-1)
        expect(testadminQuizID).toStrictEqual({ error: expect.any(String) });
    });

    test('Quiz ID does not refer to a quiz that this user owns', () => {
        const testadminQuizID = adminQuizList(-1)
        expect(testadminQuizID).toStrictEqual({ error: expect.any(String) });
    });

});

