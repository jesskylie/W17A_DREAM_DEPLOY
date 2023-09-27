import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails,
  } from './auth.js';
  
import { clear } from './other.js';

beforeEach(() => {
    clear();
  });
  

describe ('Testing adminAuthLogin', () => {
    test ('email address does not exist', () => {
        expect(adminAuthLogin('jess@hotmail.com', '123456AB')).toStrictEqual( {error: expect.any(String)} );
    });
    
    test ('password is incorrect for given email', () => {
        const NewUser = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        const login = adminAuthLogin('jess@hotmail.com', '');
        expect(login).toStrictEqual( {error: expect.any(String)} );
    });
    
    test('correct input', () => {
        const NewUser = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
        const login = adminAuthLogin('jess@hotmail.com', '123456ab');
        expect(login).toStrictEqual( { authUserId: expect.any(Number)} );
    });
    
});

describe ('Testing adminAuthRegister', () => {

    test ('Valid: Admin registered' , () => {
        expect(adminAuthRegister('any@gmail.com', '1234PassWord', 'gul','Jain').toStrictEqual({}));
    });
    test ('Invalid: NameFirst connot contain numbers', () => {
        expect(adminAuthRegister('any@gmail.com', '1234Password', 'gul01', 'Surname')).toStrictEqual({error: except.any(string)});        
    });

    test ('Invalid: NameLast connot contain numbers', () => {
        expect(adminAuthRegister('any@gmail.com', '1234Password', 'gul', 'surname09')).toStrictEqual({error: except.any(string)});        
    });

    test ('Invalid: NameFirst cannot contain symbols', () => {
        expect(adminAuthRegister('any@gmail.com', '1234Password', 'gul@%', 'surname')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameLast cannot contain symbols', () => {
        expect(adminAuthRegister('any@gmail.com', '1234Password', 'gul', 'surname%%')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameFirst must have more than 2 and less than 20 characters', () => {
        expect(adminAuthRegister('any@gmail.com', '1234Password', 'a', 'surname')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameLast must have more than 2  and less than 20 characters', () => {
        expect(adminAuthRegister('any@gmail.com', '1234Password', 'name', 'r')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameFirst must have more than 2  and less than 20 characters', () => {
        expect(adminAuthRegister('any@gmail.com', '1234Password', 'nameshouldbelessthantwenty', 'r')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameLast must have more than 2  and less than 20 characters', () => {
        expect(adminAuthRegister('any@gmail.com', '1234Password', 'name', 'surnameshouldbelessthantwenty')).toStrictEqual({error: except.any(string)});  
    });
    test ('Invalid: Password is less than 8 characters', () => {
        expect(adminAuthRegister('any@gmail.com', '1Pass', 'name', 'surname')).toStrictEqual({error: except.any(string)});  
    });

    test('Invalid: Password must contain at least one number and at least one letter', () => {
        expect(adminAuthRegister('any@gmail.com', 'invalidpassword', 'name', 'surname')).toStrictEqual({error: except.any(string)});  
    });
});

describe('Testing adminUserDetails', () => {
  test('Test Valid Auth User ID', () => {
    const authUserId = adminAuthRegister('jess@hotmail.com', '123456ab', 'Jess', 'Tran');
    const user = adminUserDetails(authUserId);
    expect(user).toStrictEqual({user: expect.any(String)});
  });
 
  test('Test Invalid Auth User ID', () => {
    const user = adminUserDetails('-234');
    expect(user).toStrictEqual({error: expect.any(String)});
    });
  })
