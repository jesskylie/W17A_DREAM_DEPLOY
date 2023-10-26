import { DataStore } from './dataStore';
import {
  retrieveDataFromFile,
  saveDataInFile,
  isTokenValid,
  getAuthUserIdUsingToken,
  createCurrentTimeStamp,
  countAllQuestions,
  countAllAnswers,
  returnRandomColour,
} from './functions';

import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

import {
  QuestionBody,
  CreateQuizQuestionReturn,
  AuthUserId,
  ErrorObjectWithCode,
  NewQuestionId,
} from './library/interfaces';

import { isAuthUserIdMatchQuizId } from './quiz';
// CONSTANTS - START

const MIN_QUESTION_STRING_LENGTH = 5;
const MAX_QUESTION_STRING_LENGTH = 50;
const MIN_NUM_ANSWERS = 2;
const MAX_NUM_ANSWERS = 6;
const POSITIVE_NUMBER_UPPER_LIMIT = 1;
const MIN_QUESTION_POINTS_AWARDED = 1;
const MAX_QUESTION_POINTS_AWARDED = 10;
const MIN_ANSWER_LENGTH = 1;
const MAX_ANSWER_LENGTH = 30;
const MAX_DURATION_IN_SECONDS = 180;

// CONSTANTS - END

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

  // Step 1: Check for 401 errors - START
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

  // Step 1: Check for 401 errors - END

  // Step 2: Check for 403 errors - START
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
  // Step 2: Check for 403 errors - END

  // Step 3: Check for 400 errors - START

  // Step 3a: Quiz ID does not refer to a valid quiz

  const isQuizIdValidTest = isQuizIdValid(data, quizId);

  if (!isQuizIdValidTest) {
    return {
      createQuizQuestionResponse: {
        error: 'Quiz ID does not refer to a valid quiz',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 3b: Question string is less than 5 characters in length or greater than 50 characters in length
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

  // Step 3c: The question has more than 6 answers or less than 2 answers

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

  // Step 3d: The question duration is not a positive number

  if (question.duration < POSITIVE_NUMBER_UPPER_LIMIT) {
    return {
      createQuizQuestionResponse: {
        error: 'The question duration is not a positive number',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 3e: The sum of the question durations in the quiz
  // exceeds 3 minutes (180 seconds: durations are listed in seconds)
  if (!isValidDurationCreate(data, quizId, question.duration)) {
    return {
      createQuizQuestionResponse: {
        error:
          'The sum of the question durations in the quiz exceeds 3 minutes',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // Step 3f: The points awarded for the question are less than 1 or greater than 10

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

  // Step 3g: The length of any answer is shorter than 1 character long, or longer than 30 characters long

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

  // Step 3h: Any answer strings are duplicates of one another (within the same question)

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

  // Step 3i: There are no correct answers

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

  // Step 3: Check for 400 errors - END

  // Step 4: all error conditions have passed
  // now, add the new question to the quiz

  // checks if it exists before accessing

  // Need to add:

  // To data.quizzes relevant object:
  // 1. change 'timeLastEdited' to time of creation of question [now] - done
  // 2. add numQuestions: the number of questions in this quiz (count) - done

  // To questions array:
  // 3. questionId: count all other questions across entire data.quizzes and add 1 - done
  const numQuestionsNow = (countAllQuestions(data) + 1) as number;

  // To specific answers:
  // 4. answerId: count all other answers across entire data.quizzes and add 1
  const newAnswerId = countAllAnswers(data);
  // 5. colour: pick random colour from constant array
  // function returnRandomColour()

  // Update question duration (total duration of all questions in quiz)
  // equals the existing duration plus the new duration

  // get current duration in all quizzes in the question

  const arrQuiz = data.quizzes;
  let existingDuration = 0;
  for (const quiz of arrQuiz) {
    if (quiz.quizId === quizId) {
      const questnArr = quiz.questions;
      for (const quest of questnArr) {
        existingDuration += quest.duration;
      }
    }
  }

  const updatedDuration = existingDuration + question.duration;

  const tempAnswerArray = question.answers;
  let tempCounter = 0;

  for (const ansArr of tempAnswerArray) {
    ansArr.answerId = newAnswerId + tempCounter;
    tempCounter++;
    ansArr.colour = returnRandomColour();
  }

  let newQuestion;
  if (question && question.question) {
    newQuestion = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: question.answers,
      questionId: numQuestionsNow,
    };
  }

  let questionIdNumber;
  // loop through to find the correct authUserId
  for (const users of data.users) {
    if (users.authUserId === authUserId) {
      if (users.quizId.includes(quizId)) {
        // found correct quiz
        const quiz = data.quizzes.find((q) => q.quizId === quizId);
        if (quiz !== undefined) {
          // update timeLastEdited
          // initially incorrect - timeLastEdited does not change
          // with creation of a question 25Oct23 19:05
          // quiz.timeLastEdited = createCurrentTimeStamp() as number;
          // update numQuestions
          const currentQuestions = quiz.numQuestions;
          quiz.numQuestions = currentQuestions + 1;

          // update question duration
          quiz.duration = updatedDuration;

          // push new question to quizzes
          quiz.questions.push(newQuestion);
          questionIdNumber = quiz.questions.length;
        }
      }
    }
  }

  saveDataInFile(data);
  return {
    createQuizQuestionResponse: { questionId: questionIdNumber },
  };
}

/**
 * Updates the relevant details of a particular question within a quiz
 * When this route is called, last edited time is updated
 * @param {quizId} number - quizId of current quiz to be updated
 * @param {questionId} number - questionId to be updated
 * @param {token} string - current token ID of session
 * @param {question} QuestionBody - new updated details of question
 * ...
 *
 * @returns {{error: string}} - an error object if an error occurs
 * @returns {{}} - returns empty object on successful question update
 */
export function updateQuizQuestion(
  quizId: number,
  questionId: number,
  token: string,
  question: QuestionBody
): Record<string, never> | ErrorObjectWithCode {
  const data = retrieveDataFromFile();

  // 401 error token is invalid
  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token provided', errorCode: 401 };
  }

  // 403 error - valid token provided but incorrect user
  const authUserIdString = getAuthUserIdUsingToken(data, token);
  const authUserId = authUserIdString.authUserId;

  // checks if current user id owns current quiz
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      if (!user.quizId.includes(quizId)) {
        return {
          error: 'Valid token provided but incorrect user',
          errorCode: 403,
        };
      }
    }
  }

  // 400 errors
  // Question Id does not refer to a valid question within this quiz
  if (!isQuestionIdValid(data, quizId, questionId)) {
    return {
      error: 'QuestionId does not refer to valid question in this quiz',
      errorCode: 400,
    };
  }

  // Question string is less than 5 characters in length or greater than 50 characters in length
  if (
    question.question.length < MIN_QUESTION_STRING_LENGTH ||
    question.question.length > MAX_QUESTION_STRING_LENGTH
  ) {
    return { error: 'Invalid Question string length', errorCode: 400 };
  }

  // The question has more than 6 answers or less than 2 answers
  if (question.answers.length < MIN_NUM_ANSWERS) {
    return { error: 'Question has less than 2 answers', errorCode: 400 };
  }

  if (question.answers.length > MAX_NUM_ANSWERS) {
    return { error: 'Question has more than 6 answers', errorCode: 400 };
  }

  // The question duration is not a positive number
  if (question.duration < POSITIVE_NUMBER_UPPER_LIMIT) {
    return {
      error: 'Question duration must be a positive number',
      errorCode: 400,
    };
  }

  // If this question were to be updated, the sum of the question durations in the quiz exceeds 3 minutes 180 secs
  if (!isValidDuration(data, quizId, questionId, question.duration)) {
    return {
      error: 'Duration total must not exceed 3 minutes',
      errorCode: 400,
    };
  }

  // The points awarded for the question are less than 1 or greater than 10
  if (question.points < MIN_QUESTION_POINTS_AWARDED) {
    return { error: 'Points awarded can not be less than 1', errorCode: 400 };
  }

  if (question.points > MAX_QUESTION_POINTS_AWARDED) {
    return { error: 'Points awarded can not be more than 10', errorCode: 400 };
  }

  // The length of any answer is shorter than 1 character long, or longer than 30 characters long
  for (const answer of question.answers) {
    const answerLength = answer.answer.length;
    if (answerLength < MIN_ANSWER_LENGTH || answerLength > MAX_ANSWER_LENGTH) {
      return {
        error: 'Length of answer must be between 1 and 30 characters',
        errorCode: 400,
      };
    }
  }

  // Any answer strings are duplicates of one another (within the same question)
  if (duplicateAnswers(question.answers.map((answer) => answer.answer))) {
    // map extracts the answer strings
    // duplicate answers returns true if they match
    return {
      error: 'Answers can not be duplicates of one another',
      errorCode: 400,
    };
  }

  // There are no correct answers
  const correctAnswers = question.answers.map((answer) => answer.correct);
  if (!correctAnswers.includes(true)) {
    return { error: 'There must be a correct answer', errorCode: 400 };
  }

  // update colours of the questions
  const tempAnswerArray = question.answers;
  for (const ansArr of tempAnswerArray) {
    ansArr.colour = returnRandomColour();
  }

  // no errors captured
  // checks if current user id owns current quiz
  const newdata = data;
  for (const user of newdata.users) {
    if (user.authUserId === authUserId) {
      if (user.quizId.includes(quizId)) {
        const newQuestion = {
          questionId: questionId,
          question: question.question,
          duration: question.duration,
          points: question.points,
          answers: question.answers,
        };
        // find current quizId in quizzes
        const quiz = data.quizzes.find((q) => q.quizId === quizId);
        for (let i = 0; i < quiz.questions.length; i++) {
          if (questionId === quiz.questions[i].questionId) {
            newdata.quizzes.find((q) => q.quizId === quizId).questions.splice(i, 1);
          }
        }
        if (quiz !== undefined) {
          quiz.questions.push(newQuestion);
          quiz.timeLastEdited = createCurrentTimeStamp();
        }
      }
    }
  }

  // const newdata = data;
  // const quizToUpdate = data.quizzes.find((quiz) => quiz.quizId === quizId);
  // let questionToUpdate = quizToUpdate.questions.find((question) => question.questionId === questionId);
  // questionToUpdate = {
  //   questionId: 100,
  //   question: question.question,
  //   duration: question.duration,
  //   points: question.points,
  //   answers: question.answers,
  // }

  // for (const quiz of newdata.quizzes) {
  //   if (quiz.quizId === quizId) {
  //     for (let replce of quiz.questions) {
  //       if (replce.questionId === questionId) {
  //         replce = {
  //           questionId: questionId,
  //           question: question.question,
  //           duration: question.duration,
  //           points: question.points,
  //           answers: question.answers,
  //         };
  //         quiz.timeLastEdited = createCurrentTimeStamp();
  //       }
  //     }
  //   }
    
  // }

  saveDataInFile(newdata);
  // successfully updated quiz question
  return {};
}

/**
 * This function loops through answers array to check for duplicates
 * if there is no duplicates, returns true, otherwise returns false
 * @param {answers} string[] - array of answers to search through
 * @returns {boolean} -if there is no duplicates, returns true, otherwise returns false=
 */
function duplicateAnswers(answers: string[]): boolean {
  const answerSet = new Set();
  for (const answer of answers) {
    if (answerSet.has(answer)) {
      // Found a duplicate
      return true;
    }
    answerSet.add(answer);
  }
  // No duplicates found
  return false;
}
/**
 * A duplicated question is immediately inserted after the source question in the questions array
 * When this route is called, the time last edited is updated
 * @param {quizId} number - quizId to search for
 * @param {questionId} number - questionId of question to search
 * @param {token} string - token to search for
 * @returns {ErrorObjectWithCode} - returns error if questionId does not refer to valid quiz, token
 * is empty/invalid, valid token is provided, but user is now an owner of the quiz
 *  @returns {NewQuestionId} - returns newQUestionId if successfully duplicates a question
 */
export function duplicateQuestion(
  quizId: number,
  questionId: number,
  token: string
): ErrorObjectWithCode | NewQuestionId {
  const data = retrieveDataFromFile();
  // token is empty/invalid return - 401 error
  if (!isTokenValid(data, token)) {
    return { error: 'Invalid token provided', errorCode: 401 };
  }

  // valid token provided but incorrect user - 403 error
  const authUserIdString = getAuthUserIdUsingToken(data, token);
  const authUserId = authUserIdString.authUserId;

  // checks if current user id owns current quiz
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      if (!user.quizId.includes(quizId)) {
        return {
          error: 'Valid token provided but incorrect user',
          errorCode: 403,
        };
      }
    }
  }

  // Question Id does not refer to a valid question within this quiz - error 400
  if (!isQuestionIdValid(data, quizId, questionId)) {
    return {
      error: 'QuestionId does not refer to valid question in this quiz',
      errorCode: 400,
    };
  }

  // find quizId to duplicate
  for (const quiz of data.quizzes) {
    // returns the index of the element in an array to duplicate
    const indexToDuplicate = quiz.questions.findIndex(
      (q) => q.questionId === questionId
    );
    data.quizzes.find((quiz) => quiz.quizId === quizId).numQuestions += 1;
    // findIndex returns -1 if no element is found
    if (indexToDuplicate !== -1) {
      // indexToDuplicate will = index of the array we want to duplicate
      const questionToDuplicate = quiz.questions[indexToDuplicate];

      const newDuplicateQuestion = {
        questionId: quiz.questions.length + 1,
        question: questionToDuplicate.question,
        duration: questionToDuplicate.duration,
        points: questionToDuplicate.points,
        answers: questionToDuplicate.answers,
      };

      // inserts new duplicate question into question array at correct index
      quiz.questions.splice(indexToDuplicate + 1, 0, newDuplicateQuestion);
      // update time last edited for quiz
      quiz.timeLastEdited = createCurrentTimeStamp();
      saveDataInFile(data);
      return { newQuestionId: newDuplicateQuestion.questionId };
    }
  }
}

function deleteQuizQuestion(
  token: string,
  quizId: number,
  questionId: number
): Record<string, never> | ErrorObjectWithCode {
  const data = retrieveDataFromFile();
  const authUserId = getAuthUserIdUsingToken(data, token);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isTokenValidTest = isTokenValid(data, token);
  if (
    !isAuthUserIdMatchQuizId(data, authUserId.authUserId, quizId) &&
    isTokenValidTest &&
    isQuizIdValidTest
  ) {
    return {
      error: 'QuizId does not match authUserId',
      errorCode: RESPONSE_ERROR_403,
    };
  }
  if (!token) {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  if (!isQuizIdValidTest) {
    return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
  }
  if (!questionId) {
    return { error: 'QuestionId is empty', errorCode: RESPONSE_ERROR_400 };
  }
  if (!isQuestionIdValid(data, quizId, questionId)) {
    return {
      error: 'QuestionId is not refer to a valid question within this quiz',
      errorCode: RESPONSE_ERROR_400,
    };
  }
  const newdata = data;
  const quizToUpdate = newdata.quizzes.find((quiz) => quiz.quizId === quizId);
  const deleteQuestion = quizToUpdate.questions.filter(
    (question) => question.questionId !== questionId
  );
  quizToUpdate.questions = deleteQuestion;
  for (let check of newdata.quizzes) {
    if (check.quizId === quizId) {
      check = quizToUpdate;
      check.numQuestions = check.numQuestions - 1;
    }
  }
  saveDataInFile(newdata);
  return {};
}

export { deleteQuizQuestion };

export function adminQuizQuestionMove(token: string,
  quizId: number,
  questionId: number,
  newPosition: number): ErrorObjectWithCode | Record<string, never> {
  const data = retrieveDataFromFile();
  const authUserIdString = getAuthUserIdUsingToken(data, token);
  const isQuizIdValidTest = isQuizIdValid(data, quizId);
  const isTokenValidTest = isTokenValid(data, token);
  if (token === '') {
    return { error: 'Token is empty', errorCode: RESPONSE_ERROR_401 };
  }

  if (!isTokenValidTest) {
    return { error: 'Token is invalid', errorCode: RESPONSE_ERROR_401 };
  }
  const newdata = data;
  const authUserId = authUserIdString.authUserId;
  // checks if current user id owns current quiz
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      if (!user.quizId.includes(quizId)) {
        return {
          error: 'Valid token provided but incorrect user',
          errorCode: 403,
        };
      }
    }
  }
  if (!isQuizIdValidTest) {
    return { error: 'QuizId is invalid', errorCode: RESPONSE_ERROR_400 };
  }
  if (!isQuestionIdValid(data, quizId, questionId)) {
    return { error: 'QuestionId is not refer to a valid question within this quiz', errorCode: RESPONSE_ERROR_400 };
  }

  const quizToUpdate = newdata.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!quizToUpdate.questions.some((quiz) => quiz.questionId === questionId)) {
    return {
      error: 'Question Id does not refer to a valid question within this quiz',
      errorCode: RESPONSE_ERROR_400,
    };
  }
  if (newPosition < 0) {
    return {
      error: 'NewPosition cannot be less than 0',
      errorCode: RESPONSE_ERROR_400,
    };
  }
  if (quizToUpdate.questions.length - 1 < newPosition) {
    return {
      error: 'NewPosition cannot be more than number of existing questions',
      errorCode: 400,
    };
  }

  const questionToMove = quizToUpdate.questions.find(
    (quiz) => quiz.questionId === questionId
  );
  const index = quizToUpdate.questions.indexOf(questionToMove);

  if (index === newPosition) {
    return {
      error: 'NewPosition cannot be position of the current question',
      errorCode: 400,
    };
  }

  quizToUpdate.questions.splice(index, 1);
  quizToUpdate.questions.splice(newPosition, 0, questionToMove);
  data.quizzes.find((quiz) => quiz.quizId === quizId).timeLastEdited =
    Math.floor(Date.now() / 1000);
  saveDataInFile(newdata);
  return {};
}

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

export const isQuestionIdValid = (
  data: DataStore,
  quizId: number,
  questionId: number
): boolean => {
  const questionIdArray = data.quizzes;
  const quizQuestionIdArray = [];
  for (const quiz of questionIdArray) {
    if (quiz.quizId === quizId) {
      for (const check of quiz.questions) {
        if (check.questionId === questionId) {
          quizQuestionIdArray.push(check);
        }
      }
    }
  }
  if (quizQuestionIdArray.length === 1) {
    return true;
  }
  return false;
};

/**
 * Checks when a question is created, if total duration is within 3 minutes (180 seconds) after adding new duration
 * @param {data} dataStore - dataStore to search through
 * @param {quizId} number - quizId of quiz to search
 * @param {newDuration} number - new duration to be updated and checked
 *
 * @returns {boolean} - returns true if duration is valid and under 3 minutes, otherwise returns false
 */
function isValidDurationCreate(
  data: DataStore,
  quizId: number,
  newDuration: number
): boolean {
  // find existing duration of quiz
  const quizArr = data.quizzes;
  let currentDuration: number;
  for (const quiz of quizArr) {
    if (quiz.quizId === quizId) {
      currentDuration = quiz.duration;
    }
  }

  if (currentDuration + newDuration > MAX_DURATION_IN_SECONDS) {
    return false;
  } else {
    return true;
  }
}

/**
 * Checks if total duration is within 3 minutes (180 seconds) after adding new duration
 * if there is no duplicates, returns true, otherwise returns false
 * @param {data} dataStore - dataStore to search through
 * @param {quizId} string[] - quizId of quiz to search
 * @param {questionId} string[] - questionId of question to search
 * @param {newDuration} string[] - new duration to be updated
 * @returns {boolean} - returns true if duration is valid and under 3 minutes, otherwise returns false
 */
function isValidDuration(
  data: DataStore,
  quizId: number,
  questionId: number,
  newDuration: number
): boolean {
  let currentDuration = 0;
  for (const quiz of data.quizzes) {
    currentDuration = currentDuration + quiz.duration;
  }
  const totalDuration = newDuration + currentDuration;
  if (totalDuration > MAX_DURATION_IN_SECONDS) {
    return false;
  }
  return true;
}
// HELPER FUNCTIONS - END
