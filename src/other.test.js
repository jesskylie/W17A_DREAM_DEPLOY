import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
import { adminQuizCreate } from './quiz.js';


describe.only('testing clear()', () => {

  // CONSTANTS USED IN TEST SUITE - START
  const EMAIL_1 = "jenny@hotmail.com";
  const PASSWORD_1 = "password1234567";
  const EMAIL_2 = "sandy@hotmail.com";
  const PASSWORD_2 = "password123456789";
  // CONSTANTS USED IN TEST SUITE - END

  test('returns empty data object after population of dataStore with data', () => {

    const userAdmin1 = adminAuthRegister(
      EMAIL_1,
      PASSWORD_1,
      "Jenny",
      "Anderson"
    );

    const userAdmin2 = adminAuthRegister(
      EMAIL_2,
      PASSWORD_2,
      "Sandy",
      "Johnson"
    );

    const quizId1 = adminQuizCreate(
      userAdmin1.authUserId,
      "quiz1",
      "A quiz about the UNSW CSE course COMP1511"
    );

    const quizId2 = adminQuizCreate(
      userAdmin2.authUserId,
      "quiz2",
      "A quiz about the UNSW CSE course COMP1531"
    );

    expect(clear()).toStrictEqual({});
  });
});

