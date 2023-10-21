import { DataStore } from './dataStore';
import {
  retrieveDataFromFile,
  saveDataInFile,
  isTokenValid,
  getAuthUserIdUsingToken,
} from './functions';

import {
  RANDOM_COLOURS_ARRAY,
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

import { adminAuthRegister } from './auth';
import { adminQuizCreate } from './quiz';

import { QuestionBody, CreateQuizQuestionReturn } from './library/interfaces';
import { isTokenKind } from 'typescript';

interface AuthUserId {
  authUserId: number;
}

// export interface QuestionId {
//   questionId: number;
// }

// export interface ErrorObjectWithCode {
//   error: string;
//   errorCode: number;
// }

// export interface CreateQuizQuestionReturn {
//   createQuizQuestionResponse: QuestionId | ErrorObjectWithCode;
// }

// CONSTANTS - START

const MIN_QUESTION_STRING_LENGTH = 5;
const MAX_QUESTION_STRING_LENGTH = 50;
const MIN_NUM_ANSWERS = 2;
const MAX_NUM_ANSWERS = 6;
const POSITIVE_NUMBER_UPPER_LIMIT = 1;
const MAX_QUESTION_DURATION = 3;
const MIN_QUESTION_POINTS_AWARDED = 1;
const MAX_QUESTION_POINTS_AWARDED = 10;
const MIN_ANSWER_LENGTH = 1;
const MAX_ANSWER_LENGTH = 30;

// CONSTANTS - END

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
  question: QuestionBody,
  quizId: number
): CreateQuizQuestionReturn {
  const data: DataStore = retrieveDataFromFile();

  console.log('question.ts - GOT TO HERE 1');
  console.log('question.ts - GOT TO HERE 1: token ->', token);
  console.log('question.ts - GOT TO HERE 1: question ->', question.question);
  console.log('question.ts - GOT TO HERE 1: quizId ->', quizId);

  // Step 1: Check for 400 errors - START

  // Step 1a: Quiz ID does not refer to a valid quiz

  const isQuizIdValidTest = isQuizIdValid(data, quizId);

  if (!isQuizIdValidTest) {
    return {
      createQuizQuestionResponse: {
        error: 'Quiz ID does not refer to a valid quiz',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 1b: Question string is less than 5 characters in length or greater than 50 characters in length
  if (
    question.question.length < MIN_QUESTION_STRING_LENGTH ||
    question.question.length > MAX_QUESTION_STRING_LENGTH
  ) {
    return {
      createQuizQuestionResponse: {
        error:
          'Question string is less than 5 characters in length or greater than 50 characters in length',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }
  console.log('question.ts - GOT TO HERE 2');
  // Step 1c: The question has more than 6 answers or less than 2 answers

  const questionAnswerArray = question.answers;
  if (
    questionAnswerArray.length < MIN_NUM_ANSWERS ||
    questionAnswerArray.length > MAX_NUM_ANSWERS
  ) {
    return {
      createQuizQuestionResponse: {
        error: 'The question has more than 6 answers or less than 2 answers',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 1d: The question duration is not a positive number

  if (question.duration < POSITIVE_NUMBER_UPPER_LIMIT) {
    return {
      createQuizQuestionResponse: {
        error: 'The question duration is not a positive number',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 1e: The sum of the question durations in the quiz exceeds 3 minutes
  // ############
  // NOT SURE ABOUT WHAT THIS TEST MEANS
  // ############

  if (question.duration > MAX_QUESTION_DURATION) {
    return {
      createQuizQuestionResponse: {
        error:
          'The sum of the question durations in the quiz exceeds 3 minutes',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 1f: The points awarded for the question are less than 1 or greater than 10

  const pointsAwarded = question.points;

  if (
    pointsAwarded < MIN_QUESTION_POINTS_AWARDED ||
    pointsAwarded > MAX_QUESTION_POINTS_AWARDED
  ) {
    return {
      createQuizQuestionResponse: {
        error:
          'The points awarded for the question are less than 1 or greater than 10',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 1g: The length of any answer is shorter than 1 character long, or longer than 30 characters long

  for (const questn of questionAnswerArray) {
    const answerLength = questn.answer.length;

    if (answerLength < MIN_ANSWER_LENGTH || answerLength > MAX_ANSWER_LENGTH) {
      return {
        createQuizQuestionResponse: {
          error:
            'The length of any answer is shorter than 1 character long, or longer than 30 characters long',
          errorCode: RESPONSE_ERROR_400,
        },
      };
    }
  }

  // Step 1h: Any answer strings are duplicates of one another (within the same question)

  const answerStringArray = [];
  for (const questn of questionAnswerArray) {
    answerStringArray.push(questn.answer);
  }
  // Create set of answerStringArray
  const answerStringArraySet = new Set(answerStringArray);

  // if size/length of original array is greater than set of that array
  // there must be duplicates, so return error

  if (answerStringArray.length > answerStringArraySet.size) {
    return {
      createQuizQuestionResponse: {
        error:
          'Any answer strings are duplicates of one another (within the same question)',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 1i: There are no correct answers

  let correctAnswersExistBool = false;

  for (const questn of questionAnswerArray) {
    if (questn.correct === true) {
      correctAnswersExistBool = true;
    }
  }

  if (!correctAnswersExistBool) {
    return {
      createQuizQuestionResponse: {
        error: 'There are no correct answers',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 1: Check for 400 errors - END

  // Step 2: Check for 401 errors - START
  // Token is empty or invalid (does not refer to valid logged in user session)

  const isTokenValidTest = isTokenValid(data, token) as boolean;

  if (!isTokenValidTest) {
    return {
      createQuizQuestionResponse: {
        error:
          'Token is empty or invalid (does not refer to valid logged in user session)',
        errorCode: RESPONSE_ERROR_401,
      },
    };
  }

  // Step 2: Check for 401 errors - END

  // Step 3: Check for 403 errors - START
  // Token is empty or invalid (does not refer to valid logged in user session)
  // Need:
  // a. authUserId
  // b. quizId
  // Then:
  // x. iterate over data.users
  // y. find user array that corresponds with authUserId
  // z. check in that user's quizid array to test whether quizId is included

  // a. get authUserId number
  const authUserIdString = getAuthUserIdUsingToken(data, token) as AuthUserId;
  const authUserId = authUserIdString.authUserId;

  // x
  const userArr = data.users;

  let userOwnsQuizBool = false;

  for (const user of userArr) {
    if (user.authUserId === authUserId && user.quizId.includes(quizId)) {
      userOwnsQuizBool = true;
    }
  }

  if (!userOwnsQuizBool) {
    return {
      createQuizQuestionResponse: {
        error: 'Valid token is provided, but user is not an owner of this quiz',
        errorCode: RESPONSE_ERROR_403,
      },
    };
  }

  // Step 3: Check for 403 errors - END

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
          return {
            createQuizQuestionResponse: { questionId: questionIdNumber },
          };
        }
      }
    }
  }

  saveDataInFile(data);
  return { createQuizQuestionResponse: { questionId: 1 } };
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
