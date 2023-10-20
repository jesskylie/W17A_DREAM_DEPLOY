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

export function createQuizQuestion(
  token: string,
  question: Question,
  quizId: number
) {
  const data: DataStore = retrieveDataFromFile();

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
          return { questionId: questionIdNumber };
        }
      }
    }
  }

  saveDataInFile(data);
  return { error: 'Error' };
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
