import httpError, { HttpError } from 'http-errors';
import { retrieveDataFromFile, saveDataInFile } from './library/functions';
import { Message } from './dataStore';
import { playerIdExists } from './answers';
import { MessageReturn } from './library/interfaces';

// sends message to everyone in the session
export function sendMessage(playerid: number, message: string): Record<string, never> | HttpError {
  const data = retrieveDataFromFile();

  // if player id does not exist - 400 error
  if (!playerIdExists(data, playerid)) {
    throw httpError(400, 'Player ID does not exist');
  }

  // if message body is less than 1 character or more than 100 characters - 400 error
  if (message.length < 1 || message.length > 100) {
    throw httpError(400, 'Message body must be between 1-100 characters long');
  }

  // finds current session player is in
  for (const copyQuiz of data.quizzesCopy) {
    const player = copyQuiz.session.players.find((player) => player.playerId === playerid);
    if (player) {
      const currSession = copyQuiz.session;

      // creates new message
      const newMessage: Message = {
        messageBody: message,
        playerId: player.playerId,
        playerName: player.name,
        timeSent: Date.now(),
      };

      currSession.messages.push(newMessage);
      saveDataInFile(data);
      return {};
    }
  }
}

// gets all chat messages for the session
export function getChatMessages(playerid: number): MessageReturn | HttpError {
  const data = retrieveDataFromFile();
  // finds current session player is in
  for (const copyQuiz of data.quizzesCopy) {
    const player = copyQuiz.session.players.find((player) => player.playerId === playerid);
    if (player) {
      // display all messages
      const currSession = copyQuiz.session;
      return { messages: currSession.messages };
    }
  }
  // playerId does not exist
  throw httpError(400, 'Player ID does not exist');
}
