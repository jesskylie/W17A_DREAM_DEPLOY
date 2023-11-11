import httpError, { HttpError } from 'http-errors';
import { getRandomInt, getState, retrieveDataFromFile, saveDataInFile } from './library/functions';
import { DataStore, State } from './dataStore';
import { ONE_MILLION } from './library/constants';

export interface PlayerId {
  playerId: number;
}

export const playerCreate = (sessionId: number, name: string): PlayerId | HttpError => {
  const data = retrieveDataFromFile();
  if (!isSessionIdValid(data, sessionId)) {
    throw httpError(400, 'SessionId is invalid');
  }

  if (getState(data, sessionId) !== State.LOBBY) {
    throw httpError(400, 'Session is not in LOBBY state');
  }

  if (name === '') {
    name = generateRandomName();
    while (isPlayerNameRepeated(data, name)) {
      name = generateRandomName();
    }
  }

  if (isPlayerNameRepeated(data, name)) {
    throw httpError(400, 'Name of user entered is not unique');
  }

  let playerId = getRandomInt(ONE_MILLION);
  while (isPlayerIdRepeated(data, playerId)) {
    playerId = getRandomInt(ONE_MILLION);
  }
  const newPlayer = {
    playerId: playerId,
    name: name,
    selectedAnswer: [[]] as number[][],
  };

  const newdata = data;
  for (const check of newdata.quizzesCopy) {
    if (check.session.sessionId === sessionId) {
      check.session.players.push(newPlayer);
    }
  }
  saveDataInFile(newdata);
  return { playerId: playerId };
};

// helper function
function isSessionIdValid(data: DataStore, sessionId: number): boolean {
  for (const check of data.quizzesCopy) {
    if (check.session.sessionId === sessionId) {
      return true;
    }
  }
  return false;
}

function isPlayerIdRepeated(data: DataStore, playerId: number): boolean {
  for (const check of data.quizzesCopy) {
    for (const player of check.session.players) {
      if (player.playerId === playerId) {
        return true;
      }
    }
  }
  return false;
}

function isPlayerNameRepeated(data: DataStore, name: string): boolean {
  for (const check of data.quizzesCopy) {
    for (const checkname of check.session.players) {
      if (checkname.name === name) {
        return true;
      }
    }
  }
  return false;
}

function generateRandomName(): string {
  const allLetters: string[] = Array.from({ length: 26 }, (_, index) => String.fromCharCode(97 + index));
  let randomName = '';
  while (randomName.length < 5) {
    randomName = randomName + allLetters[getRandomInt(allLetters.length)];
  }
  while (randomName.length < 8) {
    randomName = randomName + getRandomInt(9);
  }
  return randomName;
}
