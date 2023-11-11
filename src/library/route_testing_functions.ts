import request from 'sync-request-curl';
import HTTPError, { HttpError } from 'http-errors';
import config from '../config.json';

import {
  requestAdminQuizCreateReturn,
  requestAdminQuizListReturn,
  requestAdminQuizInfoReturn,
  QuestionBody,
  requestCreateQuestionReturn,
  requestAdminAuthLoginReturn,
  requestAdminTrashQuizRestoreReturn,
  requestAdminQuizRemoveReturn,
  AdminQuizCreateReturnCombined,
  HTTPResponse,
  RequestDeleteQuizQuestionReturn,
  TransferQuizServerReturn,
  RequestGenericReturn,
  RequestUserDetailsReturn,
  RequestAdminDetailsUpdateServerReturn,
  QuestionId,
  QuizId,
  GetSessionStatusReturnObj,
  PlayerId,
  PlayerStatus,
  SessionFinalResult,
} from './interfaces';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  WAIT_TIME,
} from './constants';
import { Action } from '../dataStore';
import { SessionId } from '../quiz';

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

interface ErrorObject {
  error: string;
}

export interface RequestAdminQuizDescriptionUpdateReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

// constants used throughout file - END

export const requestClear = () => {
  const res = request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: WAIT_TIME,
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

export function requestResultsOfAnswers(
  playerid: number,
  questionposition: number
) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerid}/question/${questionposition}/result`,
    {
      qs: { playerid, questionposition },
    }
  );
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestSessionFinalResult(
  playerid: number
): SessionFinalResult | HttpError {
  const res = request('GET', SERVER_URL + `/v1/player/${playerid}/results`, {
    qs: { playerid },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestPlayerStatus(
  playerid: number
): PlayerStatus | HttpError {
  const res = request('GET', SERVER_URL + `/v1/player/${playerid}`, {
    qs: { playerid },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestAnswerQuestion(
  playerid: number,
  answerIds: number[],
  questionposition: number
): Record<string, never> | HttpError {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/player/${playerid}/question/${questionposition}/answer`,
    {
      json: { playerid, questionposition, answerIds },
    }
  );
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
  return {};
}

export function requestPlayerCreate(
  sessionId: number,
  name: string
): PlayerId | HttpError {
  const res = request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestSessionStart(
  quizid: number,
  token: string,
  autoStartNum: number
): SessionId | HttpError {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`,
    {
      headers: { token },
      json: { quizid, autoStartNum },
    }
  );
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestViewAllSessions(token: string, quizid: number) {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/sessions`, {
    headers: { token },
    qs: { quizid },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestUpdateSessionState(
  quizid: number,
  sessionid: number,
  token: string,
  action: Action
): Record<string, never> | HttpError {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizid}/session/${sessionid}`,
    {
      headers: { token },
      json: { quizid, sessionid, action },
    }
  );
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestAdminQuizDescriptionUpdateV2(
  token: string,
  quizid: number,
  description: string
): RequestAdminQuizDescriptionUpdateReturn {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizid}/description`,
    {
      headers: { token },
      json: { quizid, description },
    }
  );
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
  }
}

export function requestUpdateQuizNameV2(
  token: string,
  quizid: number,
  name: string
) {
  const res = request('PUT', SERVER_URL + `/v2/admin/quiz/${quizid}/name`, {
    headers: { token },
    json: { name, quizid },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
  }
}

export const requestAdminQuizInfoV2 = (
  token: string,
  quizid: number
): requestAdminQuizInfoReturn => {
  const res = request('GET', SERVER_URL + `/v2/admin/quiz/${quizid}`, {
    headers: { token },
    qs: { quizid },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
  }
};

export const requestAdminQuizRemoveV2 = (token: string, quizid: number) => {
  const res = request('DELETE', SERVER_URL + `/v2/admin/quiz/${quizid}`, {
    headers: { token },
    qs: { quizid },
    timeout: WAIT_TIME,
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
};

// Paul - 7 Nov 23 - START
export function requestAdminLogoutV2(token: string): RequestGenericReturn {
  const res = request('POST', SERVER_URL + '/v2/admin/auth/logout', {
    headers: { token },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401, 'Hello this is an error');
  }
}

export function requestGetAdminUserDetailV2(
  token: string
): RequestUserDetailsReturn {
  const res = request('GET', SERVER_URL + '/v2/admin/user/details', {
    headers: { token },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
  }
}

export function requestAdminUserDetailUpdateV2(
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): RequestAdminDetailsUpdateServerReturn {
  const res = request('PUT', SERVER_URL + '/v2/admin/user/details', {
    headers: { token },
    json: {
      email,
      nameFirst,
      nameLast,
    },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestUpdatePasswordV2(
  token: string,
  oldPassword: string,
  newPassword: string
) {
  const res = request('PUT', SERVER_URL + '/v2/admin/user/password', {
    headers: { token },
    json: {
      oldPassword: oldPassword,
      newPassword: newPassword,
    },
  });
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}
// Paul - 7 Nov 23 - END

export const requestAdminQuizCreateV2 = (
  token: string,
  name: string,
  description: string
): QuizId | HttpError => {
  const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
    headers: { token },
    json: { name, description },
    timeout: WAIT_TIME,
  });

  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
};

export const requestAdminQuizCreate = (
  token: string,
  name: string,
  description: string
): requestAdminQuizCreateReturn => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description },
    timeout: WAIT_TIME,
  });
  return {
    statusCode: res.statusCode,
    bodyString: JSON.parse(res.body.toString()),
  };
};

//* *************************************************************
export const requestAdminQuizList = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};
//* *************************************************************
export const requestAdminQuizListV2 = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v2/admin/quiz/list', {
    headers: { token },
  });

  if (res.statusCode === 200) {
    return JSON.parse(res.body.toString());
  } else if (res.statusCode === 401) {
    throw HTTPError(401);
  }
};
//* *************************************************************
export const requestAdminQuizInfo = (
  token: string,
  quizid: number
): requestAdminQuizInfoReturn => {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}`, {
    qs: {
      token,
      quizid,
    },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

export function requestAdminRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    },
  });
  return {
    body: JSON.parse(res.body.toString()),
    status: res.statusCode,
  };
}

export function requestCreateQuestionV2(
  token: string,
  question: QuestionBody,
  quizid: number
): QuestionId | HttpError {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizid}/question`,
    {
      headers: { token },
      json: {
        questionBody: {
          question: question.question,
          duration: question.duration,
          points: question.points,
          answers: question.answers as QuestionBody['answers'],
          thumbnailUrl: question.thumbnailUrl,
        },
      },
      timeout: WAIT_TIME,
    }
  );
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestCreateQuestion(
  token: string,
  question: QuestionBody,
  quizId: number
): requestCreateQuestionReturn {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
    {
      json: {
        token: token,
        questionBody: {
          question: question.question,
          duration: question.duration,
          points: question.points,
          answers: question.answers as QuestionBody['answers'],
        },
      },
    }
  );
  return {
    bodyString: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export const requestAdminQuizRemove = (
  token: string,
  quizid: number
): requestAdminQuizRemoveReturn => {
  const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizid}`, {
    qs: { quizid, token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

export const requestAdminAuthLogin = (
  email: string,
  password: string
): requestAdminAuthLoginReturn => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password },
  });
  const bodyString = JSON.parse(res.body.toString());

  return { statusCode: res.statusCode, bodyString: bodyString };
};

export const requestQuizCreateCombined = (
  token: string,
  name: string,
  description: string
): AdminQuizCreateReturnCombined | HTTPResponse => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description },
  });

  const resBody = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;

  return { resBody, statusCode };
};
//* *************************************************************
//* *************************************************************
export const requestAdminTrashQuizRestore = (
  token: string,
  quizId: number
): requestAdminTrashQuizRestoreReturn => {
  const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, {
    json: { token, quizId },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};
//* *************************************************************
export const requestAdminTrashQuizRestoreV2 = (
  token: string,
  quizId: number
): requestAdminTrashQuizRestoreReturn => {
  const res = request('POST', SERVER_URL + `/v2/admin/quiz/${quizId}/restore`, {
    headers: { token },
    json: { quizId },
  });

  if (res.statusCode === 200) {
    return JSON.parse(res.body.toString());
  } else if (res.statusCode === 401) {
    throw HTTPError(RESPONSE_ERROR_401);
  } else if (res.statusCode === 400) {
    throw HTTPError(RESPONSE_ERROR_400);
  } else if (res.statusCode === 403) {
    throw HTTPError(RESPONSE_ERROR_403);
  }
};
//* *************************************************************
//* *************************************************************
export const requestAdminTrashQuizEmpty = (
  token: string,
  quizids: string
): requestAdminQuizRemoveReturn => {
  const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/trash/empty', {
    qs: { quizIds: quizids, token: token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

export function requestUpdateQuestionV2(
  quizId: number,
  questionId: number,
  token: string,
  question: QuestionBody,
  thumbnailUrl: string
): Record<string, never> | HttpError {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      headers: { token },
      json: {
        questionBody: {
          question: question.question,
          duration: question.duration,
          points: question.points,
          answers: question.answers as QuestionBody['answers'],
        },
        thumbnailUrl: thumbnailUrl,
      },
      timeout: WAIT_TIME,
    }
  );

  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestUpdateQuestion(
  quizId: number,
  questionId: number,
  token: string,
  question: QuestionBody
): requestCreateQuestionReturn {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      json: {
        token: token,
        questionBody: {
          question: question.question,
          duration: question.duration,
          points: question.points,
          answers: question.answers as QuestionBody['answers'],
        },
      },
    }
  );

  return {
    bodyString: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

export const requestDeleteQuizQuestionV2 = (
  token: string,
  quizid: number,
  questionid: number
): Record<string, never> | HttpError => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v2/admin/quiz/${quizid}/question/${questionid}`,
    {
      headers: { token },
      qs: { quizid, token, questionid },
      timeout: WAIT_TIME,
    }
  );
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
};

export const requestDeleteQuizQuestion = (
  token: string,
  quizId: number,
  questionId: number
): RequestDeleteQuizQuestionReturn => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      qs: { quizId, token, questionId },
    }
  );
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

export function requestAdminQuizQuestionMoveV2(
  token: string,
  quizid: number,
  questionid: number,
  newPosition: number
): Record<string, never> | HttpError {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizid}/question/${questionid}/move`,
    {
      headers: { token },
      json: { quizid, questionid, token, newPosition },
      timeout: WAIT_TIME,
    }
  );
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestAdminQuizQuestionMove(
  token: string,
  quizId: number,
  questionId: number,
  newPosition: number
) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/move`,
    {
      json: { quizId, questionId, token, newPosition },
    }
  );

  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
}

export function requestDuplicateQuestionV2(
  quizid: number,
  questionid: number,
  token: string
): requestCreateQuestionReturn {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizid}/question/${questionid}/duplicate`,
    {
      headers: { token },
      json: {},
      timeout: WAIT_TIME,
    }
  );
  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
}

export function requestDuplicateQuestion(
  quizId: number,
  questionId: number,
  token: string
): requestCreateQuestionReturn {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      json: {
        token: token,
      },
    }
  );
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return {
    bodyString,
    statusCode,
  };
}
//* *************************************************************
export const requestAdminTrashQuizEmptyV2 = (
  token: string,
  quizids: string
): requestAdminQuizRemoveReturn => {
  const res = request('DELETE', SERVER_URL + '/v2/admin/quiz/trash/empty', {
    headers: { token },
    qs: { quizIds: quizids },
  });

  if (res.statusCode === 200) {
    return JSON.parse(res.body.toString());
  } else if (res.statusCode === 401) {
    throw HTTPError(RESPONSE_ERROR_401);
  } else if (res.statusCode === 400) {
    throw HTTPError(RESPONSE_ERROR_400);
  } else if (res.statusCode === 403) {
    throw HTTPError(RESPONSE_ERROR_403);
  }
};
//* *************************************************************
//* *************************************************************
export const requestAdminTrashQuizList = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};
//* *************************************************************
export const requestAdminTrashQuizListV2 = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v2/admin/quiz/trash', {
    headers: { token },
  });

  if (res.statusCode === 200) {
    return JSON.parse(res.body.toString());
  } else if (res.statusCode === 401) {
    throw HTTPError(RESPONSE_ERROR_401);
  }
};

//* *************************************************************
export function requestTransferQuestion(
  token: string,
  userEmail: string,
  quizId: number
): TransferQuizServerReturn {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    {
      json: {
        token,
        userEmail,
      },
    }
  );

  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;

  return {
    bodyString,
    statusCode,
  };
}

//* *************************************************************
export function requestTransferQuestionV2(
  token: string,
  userEmail: string,
  quizId: number
): TransferQuizServerReturn {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/transfer`,
    {
      headers: { token },
      json: { userEmail },
    }
  );

  if (res.statusCode === 200) {
    return JSON.parse(res.body.toString());
  } else if (res.statusCode === 401) {
    throw HTTPError(RESPONSE_ERROR_401);
  } else if (res.statusCode === 400) {
    throw HTTPError(RESPONSE_ERROR_400);
  } else if (res.statusCode === 403) {
    throw HTTPError(RESPONSE_ERROR_403);
  }
}
//* *************************************************************

// PUT /v1/admin/quiz/{quizid}/thumbnail Update the quiz thumbnail
export const requestAdminUpdateQuizThumbnail = (
  quizid: number,
  token: string,
  imgUrl: string
): Record<string, never> => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizid}/thumbnail`,
    {
      headers: { token },
      json: { imgUrl: imgUrl },
    }
  );

  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
};

// GET /v1/admin/quiz/{quizid}/session/{sessionid} get session status
export const requestAdminGetSessionStatus = (
  quizid: number,
  sessionid: number,
  token: string
): GetSessionStatusReturnObj => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizid}/session/${sessionid}`,
    {
      headers: { token },
    }
  );

  switch (res.statusCode) {
    case RESPONSE_OK_200:
      return JSON.parse(res.body.toString());
    case RESPONSE_ERROR_401:
      throw HTTPError(RESPONSE_ERROR_401);
    case RESPONSE_ERROR_403:
      throw HTTPError(RESPONSE_ERROR_403);
    case RESPONSE_ERROR_400:
      throw HTTPError(RESPONSE_ERROR_400);
  }
};
