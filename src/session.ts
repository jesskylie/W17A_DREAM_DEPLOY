import httpError from 'http-errors';
import { Action, DataStore, Message, Player, Quizzes, ResultForEachQuestion, State } from "./dataStore";
import { ONE_MILLION } from "./library/constants";
import { getRandomInt, getState, isActionValid, retrieveDataFromFile, saveDataInFile } from "./library/functions";
import { MessageBody } from "./library/interfaces";

export const viewAllSession = (token: string, quizId: number) => {
  return { 
    "activeSessions": [
    247,
    566,
    629,
    923
  ],
  "inactiveSessions": [
    422,
    817
  ]};
}

export const startNewSession = (quizId: number, token: string, autoStartNum: number) => {
  const data = retrieveDataFromFile();
  let newdata = data;
  let copyQuiz: Quizzes;
  for (const quiz of newdata.quizzes) {
    if (quiz.quizId === quizId) {
      copyQuiz.description = quiz.description;
      copyQuiz.duration = quiz.duration;
      copyQuiz.name = quiz.name;
      copyQuiz.numQuestions = quiz.numQuestions;
      copyQuiz.quizId = quiz.quizId;
      copyQuiz.timeCreated = quiz.timeCreated;
      copyQuiz.timeLastEdited = quiz.timeLastEdited;
      copyQuiz.userId = quiz.userId;
    }
  }
  let sessionId = getRandomInt(ONE_MILLION);
  while (isSessionIdRepeated(data, sessionId)) {
    sessionId = getRandomInt(ONE_MILLION);
  }
  const session = {
    sessionId: sessionId,
    state: State.LOBBY,
    autoStartNum: autoStartNum,
    players: [] as Player[],
    result: [] as ResultForEachQuestion[],
    atQuestion: 0,
    numQuestions: copyQuiz.numQuestions,
    messages: [] as Message[],
  }
  const quizCopyObject = {
    session: session,
    metadata: copyQuiz,
  }
  newdata.quizzesCopy.push(quizCopyObject);
  saveDataInFile(newdata);
  return { sessionId: sessionId };
}

export const updateSessionState = (quizId: number, sessionId: number, token: string, action: Action) => {
  const data = retrieveDataFromFile();
  let state = getState(data, sessionId);
  if (!isActionValid(state, action)) {
    throw httpError(400, 'Action enum cannot be applied in the current state (see spec for details)');
  }
  if (action !== Action.END && action !== Action.GO_TO_ANSWER && action !== Action.GO_TO_FINAL_RESULTS 
    && action !== Action.NEXT_QUESTION && action !== Action.SKIP_COUNTDOWN) {
      throw httpError(400, 'Action provided is not a valid Action enum');
  }
  if (state === State.LOBBY && action === Action.END) {
    state = State.END;
  }
  if (state === State.LOBBY && action === Action.NEXT_QUESTION) {
    state = State.QUESTION_COUNTDOWN;
  }
  if (state === State.QUESTION_COUNTDOWN && action === Action.END) {
    state = State.END;
  }
  if (state === State.QUESTION_COUNTDOWN && action === Action.SKIP_COUNTDOWN) {
    state = State.QUESTION_OPEN;
  }
  if (state === State.QUESTION_OPEN && action === Action.END) {
    state = State.END;
  }
  if (state === State.QUESTION_OPEN && action === Action.GO_TO_ANSWER) {
    state = State.ANSWER_SHOW;
  }
  if (state === State.QUESTION_CLOSE && action === Action.END) {
    state = State.END;
  }
  if (state === State.QUESTION_CLOSE && action === Action.NEXT_QUESTION) {
    state = State.QUESTION_COUNTDOWN;
  }
  if (state === State.QUESTION_CLOSE && action === Action.GO_TO_ANSWER) {
    state = State.ANSWER_SHOW;
  }
  if (state === State.ANSWER_SHOW && action === Action.NEXT_QUESTION) {
    state = State.QUESTION_COUNTDOWN;
  }
  if (state === State.ANSWER_SHOW && action === Action.GO_TO_FINAL_RESULTS) {
    state = State.FINAL_RESULTS;
  }
  if (state === State.ANSWER_SHOW && action === Action.END) {
    state = State.END;
  }
  if (state === State.FINAL_RESULTS && action === Action.END) {
    state = State.END;
  }



  const newdata = data;
  for (const check of newdata.quizzesCopy) {
    if (check.session.sessionId === sessionId) {
      check.session.state = state;
    }
  }
  saveDataInFile(newdata);
  return {};
}

export const getSeesionStatus = (quizId: number, sessionId: number, token: string) => {
  return {
    "state": "LOBBY",
    "atQuestion": 3,
    "players": [
      "Hayden"
    ],
    "metadata": {
      "quizId": 5546,
      "name": "This is the name of the quiz",
      "timeCreated": 1683019484,
      "timeLastEdited": 1683019484,
      "description": "This quiz is so we can have a lot of fun",
      "numQuestions": 1,
      "questions": [
        {
          "questionId": 5546,
          "question": "Who is the Monarch of England?",
          "duration": 4,
          "thumbnailUrl": "http://google.com/some/image/path.jpg",
          "points": 5,
          "answers": [
            {
              "answerId": 2384,
              "answer": "Prince Charles",
              "colour": "red",
              "correct": true
            }
          ]
        }
      ],
      "duration": 44,
      "thumbnailUrl": "http://google.com/some/image/path.jpg"
    }
  };
}

export const getQuizFinalResult = (quizId: number, sessionId: number, token: string) => {
  return {
    "usersRankedByScore": [
      {
        "name": "Hayden",
        "score": 45
      }
    ],
    "questionResults": [
      {
        "questionId": 5546,
        "playersCorrectList": [
          "Hayden"
        ],
        "averageAnswerTime": 45,
        "percentCorrect": 54
      }
    ]
  };
}

export const getQuizFinalResultCSV = (quizId: number, sessionId: number, token: string) => {
  return {
    "url": "http://google.com/some/image/path.csv"
  };
}

export const playerJoinSession = (sessionId: number, name: string) => {
  return {
    playerId: 0
  };
}

export const playerStatus = (playerId: number) => {
  return {
    "state": "LOBBY",
    "numQuestions": 1,
    "atQuestion": 3
  };
}

export const playerCurrentQuestionInfo = (playerId: number, questionposition: number) => {
  return {
    "questionId": 5546,
    "question": "Who is the Monarch of England?",
    "duration": 4,
    "thumbnailUrl": "http://google.com/some/image/path.jpg",
    "points": 5,
    "answers": [
      {
        "answerId": 2384,
        "answer": "Prince Charles",
        "colour": "red"
      }
    ]
  };
}

export const playerSubmit = (playerId: number, questionposition: number, answerId: number[], ) => {
  return {};
}

export const questionResult = (playerId: number, questionposition: number) => {
  return {
    "questionId": 5546,
    "playersCorrectList": [
      "Hayden"
    ],
    "averageAnswerTime": 45,
    "percentCorrect": 54
  };
}

export const sessionFinalResult = (playerId: number) => {
  return {
    "usersRankedByScore": [
      {
        "name": "Hayden",
        "score": 45
      }
    ],
    "questionResults": [
      {
        "questionId": 5546,
        "playersCorrectList": [
          "Hayden"
        ],
        "averageAnswerTime": 45,
        "percentCorrect": 54
      }
    ]
  };
}

export const getAllChatMessage = (playerId: number) => {
  return {
    "messages": [
      {
        "messageBody": "This is a message body",
        "playerId": 5546,
        "playerName": "Yuchao Jiang",
        "timeSent": 1683019484
      }
    ]
  };
}

export const sendChatMessage = (message: MessageBody, playerId: number) => {
  return {};
}

const isSessionIdRepeated = (data: DataStore, sessionId: number): boolean => {
  const sessionIdArr = data.quizzesCopy;
  for (const check of sessionIdArr) {
    if (check.session.sessionId === sessionId) {
      return true;
    }
  }
  return false;
}