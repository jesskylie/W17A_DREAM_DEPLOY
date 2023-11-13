import httpError, { HttpError } from 'http-errors';
import { retrieveDataFromFile, saveDataInFile } from './library/functions';
import { DataStore, State, ResultForEachQuestion } from './dataStore';
import { HALF_SEC } from './library/constants';

/**
 * Gets the results for a particular question of the session a player is playing in
 * throws HTTP Error 400 if any of the following are true
 * - If any of the following are true:
 * - If player ID does not exist
 * - If question position is not valid for the session this player is in
 * - Session is not in ANSWER_SHOW state
 * - If session is not yet up to this question
 * @param {playerid} - playerid: number
 * @param {questionposition}
 * @returns {{questionId: number, playersCorrectList: string[], averageAnswerTime: number,
 * percentCorrect: number}}
 * @returns {{error: string}} - on error
 */
export function getResultsOfAnswers(
  playerid: number,
  questionposition: number
): ResultForEachQuestion | HttpError {
  const data = retrieveDataFromFile();

  // If player ID does not exist - error 400
  if (!playerIdExists(data, playerid)) {
    throw httpError(400, 'Player ID does not exist');
  }

  // If question position is not valid for the session this player is in- 400 error
  if (!isQuestionPositionValid(data, playerid, questionposition)) {
    throw httpError(
      400,
      'Question position is not valid for the session this player is in'
    );
  }

  // Session is not in ANSWER_SHOW state- 400 error
  if (!isSessionInAnswerShowState(data, playerid)) {
    throw httpError(400, 'Session is not in ANSWER_SHOW state');
  }

  // If session is not yet up to this question- 400 error
  if (!isValidQuestionPosition(data, playerid, questionposition)) {
    throw httpError(400, 'Session is not yet up to this question');
  }

  // get the reuslts for question
  for (const session of data.quizzesCopy) {
    for (const player of session.session.players) {
      if (player.playerId === playerid) {
        return session.session.result[session.session.atQuestion - 1];
      }
    }
  }
}

/**
 * Allow the current player to submit answer(s) to the currently active question
 * Returns {} on successful submission
 * @param {number} - playerid
 * @param {number[]} - answerIds
 * @returns {number} - true or false
 */
export function submissionOfAnswers(
  playerid: number,
  answerIds: number[],
  questionposition: number
): Record<string, never> | HttpError {
  const data = retrieveDataFromFile();

  // If player ID does not exist - error 400
  if (!playerIdExists(data, playerid)) {
    throw httpError(400, 'Player ID does not exist');
  }

  // If question position is not valid for the session this player is in - error 400
  if (!isQuestionPositionValid(data, playerid, questionposition)) {
    throw httpError(
      400,
      'Question position is not valid for the session this player is in'
    );
  }

  // Session is not in QUESTION_OPEN state - error 400
  if (!isSessionInQuestionOpenState(data, playerid)) {
    throw httpError(400, 'Session is not in QUESTION_OPEN state');
  }

  // Session is not yet up to this particular question - 400 error
  if (!isValidQuestionPosition(data, playerid, questionposition)) {
    throw httpError(400, 'Session is not yet up to this question');
  }

  // Answer IDs are not valid for this particular question - error 400
  if (!validAnswerId(data, answerIds)) {
    throw httpError(
      400,
      'Answer Ids are not valid for this particular question'
    );
  }

  // There are duplicate answer IDs provided - error 400
  if (duplicateAnswerIds(answerIds)) {
    throw httpError(400, 'There are duplicate answer Ids provided');
  }

  // Less than 1 answer ID was submitted - error 400
  if (answerIds.length < 1) {
    throw httpError(400, 'Less than 1 answer ID was submitted ');
  }

  // save submission of answers to results for each question
  for (const session of data.quizzesCopy) {
    for (const player of session.session.players) {
      if (player.playerId === playerid) {
        const currSession = session.session;
        const currQuizQuestion = session.metadata;
        const questionId = currQuizQuestion.questions[questionposition - 1].questionId;
        const playersArray = currSession.players;
        const atQuestion = session.session.atQuestion - 1;
        if (session.session.result.length < session.session.atQuestion) {
          const playersCorrectList: string[] = [];
          const isCorrect = checkIfAnswerIsCorrect(
            data,
            answerIds,
            playerid,
            atQuestion
          );
          if (isCorrect) {
            playersCorrectList.push(player.name);
          }
          let averageAnswerTime = 0;
          player.timeAnswered = Date.now();
          if (Math.round(player.timeAnswered -
          session.metadata.questions[atQuestion].questionStartTime) / 1000 >= HALF_SEC) {
            averageAnswerTime = Math.round((player.timeAnswered -
            session.metadata.questions[atQuestion].questionStartTime) / 1000);
          }
          const newResult = {
            questionId: questionId,
            playersCorrectList: playersCorrectList,
            averageAnswerTime: averageAnswerTime,
            percentCorrect: (playersCorrectList.length / playersArray.length) * 100,
          };
          session.session.result.push(newResult);
        } else {
          const isCorrect = checkIfAnswerIsCorrect(
            data,
            answerIds,
            playerid,
            atQuestion
          );
          if (isCorrect) {
            session.session.result[questionposition - 1].playersCorrectList.push(player.name);
          }
          let playerAnswerTime = 0;
          if (player.timeAnswered) {
            playerAnswerTime = Date.now() - player.timeAnswered;
          } else {
            playerAnswerTime = Date.now() - session.metadata.questions[atQuestion].questionStartTime;
          }
          if ((playerAnswerTime + session.session.result[atQuestion].averageAnswerTime *
          playersArray.length) / playersArray.length < HALF_SEC) {
            session.session.result[atQuestion].averageAnswerTime = 0;
          } else {
            session.session.result[atQuestion].averageAnswerTime = Math.round((playerAnswerTime / 1000 +
            session.session.result[atQuestion].averageAnswerTime *
            playersArray.length) / playersArray.length);
          }
          session.session.result[atQuestion].percentCorrect =
          (session.session.result[atQuestion].playersCorrectList.length / playersArray.length) * 100;
        }
      }
    }
  }
  saveDataInFile(data);
  return {};
}

/**
 * Checks for valid question position
 * Returns true if it is valid, false otherwise
 * @param {Datastore} - data
 * @param {number} - playerid
 * @param {Datastore} - data
 * @params {number} - questionposition
 * @returns {boolean}
 */
function isQuestionPositionValid(
  data: DataStore,
  playerid: number,
  questionposition: number
): boolean {
  // finds current session using playerId
  for (const copyQuiz of data.quizzesCopy) {
    const player = copyQuiz.session.players.find(
      (player) => player.playerId === playerid
    );
    if (player) {
      const currQuiz = copyQuiz.session;
      if (questionposition >= 0 && questionposition <= currQuiz.numQuestions) {
        return true;
      } else {
        return false;
      }
    }
  }
}

/**
 * Checks if player id exists in current session
 * Returns true if it is valid, false otherwise
 * @param {Datastore} - data
 * @param {number} - playerid
 * @param {Datastore} - data
 * @returns {boolean}
 */
export function playerIdExists(data: DataStore, playerid: number): boolean {
  for (const copyQuiz of data.quizzesCopy) {
    const player = copyQuiz.session.players.find(
      (player) => player.playerId === playerid
    );
    if (player) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if answer Id exists
 * Returns true if it is valid, false otherwise
 * @param {Datastore} - data
 * @param {number[]} - answerId
 * @returns {boolean}
 */
function validAnswerId(data: DataStore, answerId: number[]): boolean {
  for (const copyQuiz of data.quizzesCopy) {
    const metadata = copyQuiz.metadata;
    const questionsArray = metadata.questions;
    for (const questions of questionsArray) {
      // answer is an array of numbers
      // check every element in answerId [] exists in question.answers answer id
      if (
        answerId.every((answerid) =>
          questions.answers.some((answer) => answer.answerId === answerid)
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 *Checks for duplicate answers in answer id array
 * Returns true if it is valid, false otherwise
 * @param {numner[]} - answerIds
 * @returns {boolean}
 */
function duplicateAnswerIds(answerIds: number[]): boolean {
  const answerIdsCurrChecked: number[] = [];
  for (const answerId of answerIds) {
    if (answerIdsCurrChecked.includes(answerId)) {
      // found duplicate ids
      return true;
    } else {
      // push answer id to curr checked array
      answerIdsCurrChecked.push(answerId);
    }
  }
  // no duplicate answerIds found
  return false;
}

/**
 * Checks if session is in QUESTION_OPEN state
 * Returns true if it is valid, false otherwise
 * @param {DataStore} - data
 * @param {number} - playerid
 * @returns {boolean}
 */
function isSessionInQuestionOpenState(
  data: DataStore,
  playerid: number
): boolean {
  for (const copyQuiz of data.quizzesCopy) {
    const player = copyQuiz.session.players.find(
      (player) => player.playerId === playerid
    );
    if (player) {
      const currQuizSession = copyQuiz.session;
      if (currQuizSession.state === State.QUESTION_OPEN) {
        return true;
      } else {
        return false;
      }
    }
  }
}

/**
 * Checks if session is in ANSWER_SHOW state
 * Returns true if it is valid, false otherwise
 * @param {DataStore} - data
 * @param {number} - playerid
 * @returns {boolean}
 */
function isSessionInAnswerShowState(
  data: DataStore,
  playerid: number
): boolean {
  for (const copyQuiz of data.quizzesCopy) {
    const player = copyQuiz.session.players.find(
      (player) => player.playerId === playerid
    );
    if (player) {
      const currQuizSession = copyQuiz.session;
      if (currQuizSession.state === State.ANSWER_SHOW) {
        return true;
      } else {
        return false;
      }
    }
  }
}

/**
 * checks if question is in valid position
 * Returns true if it is valid, false otherwise
 * @param {DataStore} - data
 * @param {number} - playerid
 * @param {number} - questionposition
 * @returns {boolean}
 */
function isValidQuestionPosition(
  data: DataStore,
  playerid: number,
  questionposition: number
): boolean {
  for (const copyQuiz of data.quizzesCopy) {
    const player = copyQuiz.session.players.find(
      (player) => player.playerId === playerid
    );
    if (player) {
      const currQuizSession = copyQuiz.session;
      if (currQuizSession.atQuestion === questionposition) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if an answer in the selected answers array is correct
 * Returns true if all the answers are correct
 * Returns false otherwise
 * @param {Datastore} - data
 * @param {number[]} - answerIds
 * @param {number} - playerId
 * @param {number} - atQuestion
 * @returns {boolean} - true or false
*/
function checkIfAnswerIsCorrect(data: DataStore, answerIds: number[], playerId: number, atQuestion: number) {
  for (const session of data.quizzesCopy) {
    for (const player of session.session.players) {
      if (player.playerId === playerId) {
        const correctAnswers = session.metadata.questions[atQuestion].answers
          .filter(answer => answer.correct)
          .map(answer => answer.answerId);
        const allCorrectAnswers = correctAnswers.every(correctAnswer => answerIds.includes(correctAnswer));
        if (allCorrectAnswers) {
          // returns true if all answers in array were selected
          return true;
        } else {
          // returns false if not all the correct answers in the array were selected
          return false;
        }
      }
    }
  }
}
