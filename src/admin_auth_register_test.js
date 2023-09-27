import { adminAuthRegister } from './auth.js';

describe ('Testing adminAuthRegister', () => {
    test ('Invalid: NameFirst connot contain numbers', () => {
        expect(adminAuthLogin('any@gmail.com', '1234Password', 'gul01', 'Surname')).toStrictEqual({error: except.any(string)});        
    });

    test ('Invalid: NameLast connot contain numbers', () => {
        expect(adminAuthLogin('any@gmail.com', '1234Password', 'gul', 'surname09')).toStrictEqual({error: except.any(string)});        
    });

    test ('Invalid: NameFirst cannot contain symbols', () => {
        expect(adminAuthLogin('any@gmail.com', '1234Password', 'gul@%', 'surname')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameLast cannot contain symbols', () => {
        expect(adminAuthLogin('any@gmail.com', '1234Password', 'gul', 'surname%%')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameFirst must have more than 2 and less than 20 characters', () => {
        expect(adminAuthLogin('any@gmail.com', '1234Password', 'a', 'surname')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameLast must have more than 2  and less than 20 characters', () => {
        expect(adminAuthLogin('any@gmail.com', '1234Password', 'name', 'r')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameFirst must have more than 2  and less than 20 characters', () => {
        expect(adminAuthLogin('any@gmail.com', '1234Password', 'nameshouldbelessthantwenty', 'r')).toStrictEqual({error: except.any(string)});  
    });

    test ('Invalid: NameLast must have more than 2  and less than 20 characters', () => {
        expect(adminAuthLogin('any@gmail.com', '1234Password', 'name', 'surnameshouldbelessthantwenty')).toStrictEqual({error: except.any(string)});  
    });
    test ('Invalid: Password is less than 8 characters', () => {
        expect(adminAuthLogin('any@gmail.com', '1Pass', 'name', 'surname')).toStrictEqual({error: except.any(string)});  
    });

    test('Invalid: Password must contain at least one number and at least one letter', () => {
        expect(adminAuthLogin('any@gmail.com', 'invalidpassword', 'name', 'surname')).toStrictEqual({error: except.any(string)});  
    });
});