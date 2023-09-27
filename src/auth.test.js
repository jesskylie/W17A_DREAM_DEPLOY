import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails,
} from './auth.js';

import { clear } from './other.js';

beforeEach(() => {
    clear();
});


describe('Testing adminAuthLogin', () => {
    test('email address does not exist', () => {
        expect(adminAuthLogin('jess@hotmail.com', '123456AB')).toStrictEqual({ error: expect.any(String) });
    });

    test('password is incorrect for given email', () => {
        const NewUser = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        const login = adminAuthLogin('jess@hotmail.com', '');
        expect(login).toStrictEqual({ error: expect.any(String) });
    });

    test('correct input', () => {
        const NewUser = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        const login = adminAuthLogin('jess@hotmail.com', '123456ab');
        expect(login).toStrictEqual({ authUserId: expect.any(Number) });
    });

});

describe('Testing adminAuthRegister-Paul', () => {
    test('email address is used by another user', () => {

        const NewUser_1 = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        const NewUser_2 = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        expect(NewUser_2).toStrictEqual({ error: expect.any(String) });
    });

    test('email address is not a valid email', () => {

        const NewUser = adminAuthRegister('jess@hotmail.', '123456ab', 'Jess', 'Tran');
        expect(NewUser).toStrictEqual({ error: expect.any(String) });
    });
})