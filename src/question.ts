import { DataStore } from './dataStore';
import {
  retrieveDataFromFile,
  saveDataInFile,
  isTokenValid,
  getAuthUserIdUsingToken,
} from './functions';

import { RANDOM_COLOURS_ARRAY } from './library/constants';

import { adminAuthRegister } from './auth';
import { adminQuizCreate } from './quiz';

interface TokenString {
  token: string;
}

interface AuthUserId {
  authUserId: number;
}

interface Question {
  questionBody: {
    question: string;
    duration: number;
    points: number;
    answers: {
      answer: string;
      correct: boolean;
    }[];
  };
}

export interface QuestionId {
  questionId: number;
}

export interface ErrorObjectWithCode {
  error: string;
  errorCode: number;
}

export interface CreateQuizQuestionReturn {
  createQuizQuestionResponse: number | ErrorObjectWithCode;
}

/**
 * Function to generate random number
 * from 0 to max - 1
 * eg:
 *   console.log(getRandomInt(3));
 * Expected output: 0, 1 or 2
 * Used in:
 * createQuizQuestion()
 * From:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 *
 * @param {number} max - the max number
 * ...
 *
 * @returns {number} - the random number generated
 * between 0 and up to but not including max
 */
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

// From swagger.yaml
// Create a new stub question for a particular quiz.
// When this route is called, and a question is created,
// the timeLastEdited is set as the same as the created time,
// and the colours of all answers of that question are randomly generated.

/**
 * Printing out the the quiz information
 * From swagger.yaml
 * Create a new stub question for a particular quiz.
 * When this route is called, and a question is created,
 * the timeLastEdited is set as the same as the created time,
 * and the colours of all answers of that question are randomly generated.
 *
 * @param {string} token - the token of the person want to print quiz - must exist / be valid / be unique
 * @param {Question} question - the new question: new type Question
 * @param {quizId} number
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {{questionId}} - an object of the questionId, a unique number
 */
export function createQuizQuestion(
  token: string,
  question: Question,
  quizId: number
): CreateQuizQuestionReturn {
  const data: DataStore = retrieveDataFromFile();

  // Step 1: Check for 400 errors
  // Step 1a: Quiz ID does not refer to a valid quiz

  const isQuizIdValidTest = isQuizIdValid(data, quizId);

  //gets authUserId number
  const authUserIdString = getAuthUserIdUsingToken(data, token) as AuthUserId;
  const authUserId = authUserIdString.authUserId;

  //checks if it exists before accessing
  let newQuestion;
  if (question && question.questionBody && question.questionBody.question) {
    newQuestion = {
      questionBody: {
        question: question.questionBody.question,
        duration: question.questionBody.duration,
        points: question.questionBody.points,
        answers: question.questionBody.answers,
      },
    };
  }

  let questionIdNumber;
  //loop through to find the correct authUserId
  for (const users of data.users) {
    if (users.authUserId === authUserId) {
      if (users.quizId.includes(quizId)) {
        //found correct quiz
        const quiz = data.quizzes.find((q) => q.quizId === quizId);
        if (quiz != undefined) {
          //push new question to quizzes
          quiz.questions.push(newQuestion);
          questionIdNumber = quiz.questions.length;
          return { createQuizQuestionResponse: questionIdNumber };
        }
      }
    }
  }

  saveDataInFile(data);
  return { createQuizQuestionResponse: 1 };
}

//debugging code
// const admin = adminAuthRegister('jess@hotmail.com', '123456abcdefg', 'Jess', 'Tran');
// if ('token' in admin) {
//   const newQuiz= adminQuizCreate(admin.token, 'New Quiz', 'This is my first quiz');
//   if ('quizId' in newQuiz) {
//     const validQuestion = {
// 			questionBody: {
// 				question: 'What color is the sky?',
// 				duration: 2,
// 				points: 10,
// 				answers: [
// 					{
// 						answer: 'Blue',
// 						correct: true,
// 					},
// 					{
// 						answer: 'Green',
// 						correct: false,
// 					},
// 				],
// 			}
// 		};
//     const validQuestion2 = {
// 			questionBody: {
// 				question: 'What color is the sky?',
// 				duration: 2,
// 				points: 10,
// 				answers: [
// 					{
// 						answer: 'Blue',
// 						correct: true,
// 					},
// 					{
// 						answer: 'Green',
// 						correct: false,
// 					},
// 				],
// 			}
// 		};
//    console.log(createQuizQuestion(admin.token, validQuestion, newQuiz.quizId));
//     console.log(createQuizQuestion(admin.token, validQuestion2, newQuiz.quizId));
//   }
// }

// HELPER FUNCTIONS - START

/**
 * Function to test whether quizId is valid
 * Used in:
 * adminQuizInfo()
 * adminQuizRemove()
 *
 * @param {object} data - the dataStore object
 * @param {number} quizId - the id of the quiz
 * ...
 *
 * @returns {boolean} - true if authId is valid / false if authId is not valid
 */
function isQuizIdValid(data: DataStore, quizId: number): boolean {
  // 1. test for quizId is integer or less than 0
  if (!Number.isInteger(quizId) || quizId < 0) {
    return false;
  }

  // 2. test that quizId exists in dataStore
  const quizzesArr = data.quizzes;
  const userIdArr = [];
  for (const arr of quizzesArr) {
    if (arr.quizId === quizId) {
      userIdArr.push(quizId);
    }
  }
  if (userIdArr.length === 1) {
    return true;
  }

  return false;
}

// HELPER FUNCTIONS - END
