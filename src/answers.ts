import httpError, { HttpError } from 'http-errors';
import { retrieveDataFromFile, saveDataInFile } from './library/functions';
import { DataStore, State } from './dataStore';

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

  // finds current session using playerId
  for (const copyQuiz of data.quizzesCopy) {
    const player = copyQuiz.session.players.find(
      (player) => player.playerId === playerid
    );
    if (player) {
      player.selectedAnswer[questionposition] = answerIds;
    } else {
      throw httpError(400, 'Player is not in a valid session');
    }
  }
  saveDataInFile(data);
  return {};
}

// checks for valid question position
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

// checks if playerid exists
function playerIdExists(data: DataStore, playerid: number): boolean {
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

// checks if answer Id exists
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

// checks for duplicate answers in answer id array
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

// checks if session is not in QUESTION_OPEN state
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
