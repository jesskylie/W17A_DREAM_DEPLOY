import httpError, { HttpError } from 'http-errors';
import { retrieveDataFromFile, saveDataInFile } from './library/functions';

export function submissionOfAnswers(
  playerid: number,
  answerIds: number[],
  questionposition: number
): Record<string, never> | HttpError {
  const data = retrieveDataFromFile();

  // loop through QuizzesCopy sessions to find

  // If player ID does not exist - error 400

  // Session is not in QUESTION_OPEN state - error 400

  // If session is not yet up to this question - error 400

  // Answer IDs are not valid for this particular question - error 400

  // There are duplicate answer IDs provided - error 400

  // Less than 1 answer ID was submitted - error 400

  // finds current session using playerId
  for (const copyQuiz of data.quizzesCopy) {
    const player = copyQuiz.session.players.find((player) => player.playerId === playerid);
    if (player) {
      const currQuiz = copyQuiz.metadata;
      const currQuestion = currQuiz.questions[questionposition];
      if (questionposition >= 0 && questionposition <= currQuiz.numQuestions) {
        // updates the selectedAnswers for the position
        player.selectedAnswer[questionposition] = answerIds;
      } else {
        throw httpError(400, 'Question position is not valid for the session this player is in');
      }
    } else {
      throw httpError(400, 'Player is not in a valid session');
    }
  }
  saveDataInFile(data);
  return {};
}
