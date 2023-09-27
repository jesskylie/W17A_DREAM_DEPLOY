import {
    adminQuizList,
    adminQuizCreate,
    adminQuizRemove,
    adminQuizInfo,
    adminQuizNameUpdate,
    adminQuizDescriptionUpdate,
  } from './quiz.js';

import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails,
} from './auth.js';

import { clear } from './other.js';

beforeEach(() => {
    clear();
});

describe('Testing adminQuizInfo', () => {
  test ('Valid input', () => {
    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const QuizOne = adminQuizCreate(JackUser, 'Jack', 'this is my first quiz');
    expect(adminQuizInfo(JackUser, QuizOne)).toStrictEqual({
      quizId: QuizOne.quizId,
      name: QuizOne.name,
      timeCreated: QuizOne.timeCreated,
      timeLastEdited: QuizOne.timeLastEdited,
      description: QuizOne.description,
    });
    
    const QuizTwo = adminQuizCreate(JackUser, 'Jack', 'this is my second quiz');
    expect(adminQuizInfo(JackUser, QuizTwo)).toStrictEqual({
      quizId: QuizTwo.quizId,
      name: QuizTwo.name,
      timeCreated: QuizTwo.timeCreated,
      timeLastEdited: QuizTwo.timeLastEdited,
      description: QuizTwo.description,
    });
  });
  
  test ('AuthUserId is not a valid user', () => {
    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const QuizOne = adminQuizCreate(JackUser, 'Jack', 'different quiz');
    expect (adminQuizInfo('', QuizOne)).toStrictEqual( {error: expect.any(String)} );
    expect (adminQuizInfo('Angel', QuizOne)).toStrictEqual( {error: expect.any(String)} );
  });
  
  test ('Quiz ID does not refer to a valid quiz', () => {
    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const QuizOne = adminQuizCreate(JackUser, 'Jack', 'different quiz');
    expect (adminQuizInfo(JackUser, '')).toStrictEqual( {error: expect.any(String)} );
    expect (adminQuizInfo(JackUser, 'S')).toStrictEqual( {error: expect.any(String)} );
  });
  
  test ('Quiz ID does not refer to a quiz that this user owns', () => {
    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const JacksQuiz = adminQuizCreate(JackUser, 'Jack', 'Jacks quiz');
    const TonyUser = adminAuthRegister('tony@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const TonyQuiz = adminQuizCreate(TonyUser, 'Jack', 'Tonys quiz');
    expect (adminQuizInfo(JackUser, TonyQuiz)).toStrictEqual( {error: expect.any(String)} );
    expect (adminQuizInfo(TonyUser, JacksQuiz)).toStrictEqual( {error: expect.any(String)} );
  });
});

describe('Testing adminQuizCreate', () => {
    test('Test Valid Auth User ID', () => {
      const authUserId = adminAuthRegister('email@gamil.com', 'password', 'Saarthak', 'Sinha');
      const quizId = adminQuizCreate(authUserId, 'Saarthak', description);
      expect(quizId).toStrictEqual({quizId: expect.any(Number)});
    });
   
    test('Test Invalid Auth User ID', () => {
      const authUserId = adminAuthRegister('email@gamil.com', 'password', 'Saarthak', 'Sinha');
      const quizId = adminQuizCreate('-111111', 'Saarthak', description);
      expect(quizId).toStrictEqual({error: expect.any(String)});
      });
    
    test('Test Valid Name', () => {
      const authUserId = adminAuthRegister('email@gamil.com', 'password', 'Saarthak', 'Sinha');
      const quizId = adminQuizCreate(authUserId, 'Saarthak', description);
        expect(quizId).toStrictEqual({quizId: expect.any(Number)});
      });
    
      test('Test Invalid Name', () => {
        const authUserId = adminAuthRegister('email@gamil.com', 'password', 'Saarthak', 'Sinha');
        const quizId = adminQuizCreate(authUserId, '???!!!', description);
        expect(quizId).toStrictEqual({error: expect.any(String)});
      });

      test('Test Invalid Samll Name Size', () => {
        const authUserId = adminAuthRegister('email@gamil.com', 'password', 'Saarthak', 'Sinha');
        const quizId = adminQuizCreate(authUserId, 'ai', description);
        expect(quizId).toStrictEqual({error: expect.any(String)});
      });
      
      test('Test Invalid Large Name Size', () => {
        const authUserId = adminAuthRegister('email@gamil.com', 'password', 'Saarthak', 'Sinha');
        const quizId = adminQuizCreate(authUserId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', description);
        expect(quizId).toStrictEqual({error: expect.any(String)});
      });

      test('Test Invalid Repeated Name', () => {
        const authUserId = adminAuthRegister('email@gamil.com', 'password', 'Saarthak', 'Sinha');
        const quizId = adminQuizCreate(authUserId, 'Saarthak', description);
        const quizId2 = adminQuizCreate(authUserId, 'Saarthak', description);
        expect(quizId2).toStrictEqual({error: expect.any(String)});
      });
    
      test('Test Valid Description', () => {
        const authUserId = adminAuthRegister('email@gamil.com', 'password', 'Saarthak', 'Sinha');
        const quizId = adminQuizCreate(authUserId, 'Saarthak', '');
        expect(quizId).toStrictEqual({quizId: expect.any(Number)});
      });

      test('Test Invalid Description', () => {
        const authUserId = adminAuthRegister('email@gamil.com', 'password', 'Saarthak', 'Sinha');
        const quizId = adminQuizCreate(authUserId, 'Saarthak', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        expect(quizId).toStrictEqual({error: expect.any(String)});
      });
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

describe('Testing adminQuizList', () => {
  test('Test Valid Auth User ID', () => {
    const authUserId = adminAuthRegister('Belinda@gamil.com', 'password', 'Belinda', 'Wong');
    const quizzes = adminQuizList(authUserId);
    expect(quizzes).toStrictEqual({quizzes: expect.any(String)});
  });
 
  test('Test Invalid Auth User ID', () => {
    const quizzes = adminQuizCreate('-111111');
    expect(quizzes).toStrictEqual({error: expect.any(String)});
    });
});

