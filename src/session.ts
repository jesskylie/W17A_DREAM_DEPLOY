import { Action } from "./dataStore";
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
  return { sessionId: 0 };
}

export const updateSessionState = (quizId: number, sessionId: number, token: string, action: Action) => {
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