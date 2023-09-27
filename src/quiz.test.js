import {
    adminAuthRegister,
  } from './auth.js';

  import {
    adminQuizCreate
  } from './quiz.js';
  
import { clear } from './other.js';

beforeEach(() => {
    clear();
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