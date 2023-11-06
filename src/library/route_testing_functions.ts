import request from 'sync-request-curl';
import config from '../config.json';
import { WAIT_TIME } from './constants';

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
} from './interfaces';

import HTTPError from 'http-errors';
// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// constants used throughout file - END

export const requestClear = () => {
  const res = request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: WAIT_TIME,
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

export const requestAdminQuizCreateV2 = (
  token: string,
  name: string,
  description: string
) => {
  const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
    headers: { token },
    json: { name, description },
    timeout: WAIT_TIME,
  });
  if (res.statusCode === 200) {
    return JSON.parse(res.body.toString());
  } else if (res.statusCode === 401) {
    throw HTTPError(401);
  } else if (res.statusCode === 400) {
    throw HTTPError(400);
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

//**************************************************************
export const requestAdminQuizList = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};
//**************************************************************
export const requestAdminQuizListV2 = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v2/admin/quiz/list', {
    headers: { token },
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  if (res.statusCode === 200) {
    return bodyString;
  } else if (res.statusCode === 401) {
    throw HTTPError(401);
  }
};
//**************************************************************
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
//**************************************************************
//**************************************************************
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
//**************************************************************
export const requestAdminTrashQuizRestoreV2 = (
  token: string,
  quizId: number
): requestAdminTrashQuizRestoreReturn => {
  const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, {
    json: { token, quizId },
  });
  const bodyString = JSON.parse(res.body.toString());
  if (res.statusCode === 200) {
    return bodyString;
  } else if (res.statusCode === 401) {
    throw HTTPError(401);
  } else if (res.statusCode === 400) {
    throw HTTPError(400);
  } else if (res.statusCode === 403) {
    throw HTTPError(403);
  }
};
//**************************************************************
//**************************************************************
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
//**************************************************************
export const requestAdminTrashQuizEmptyV2 = (
  token: string,
  quizids: string
): requestAdminQuizRemoveReturn => {
  const res = request('DELETE', SERVER_URL + '/v2/admin/quiz/trash/empty', {
    headers: { token },
    qs: { quizIds: quizids, token: token }
  });
  const bodyString = JSON.parse(res.body.toString());
  if (res.statusCode === 200) {
    return bodyString;
  } else if (res.statusCode === 401) {
    throw HTTPError(401);
  } else if (res.statusCode === 400) {
    throw HTTPError(400);
  } else if (res.statusCode === 403) {
    throw HTTPError(403);
  } 
};
//**************************************************************
//**************************************************************
export const requestAdminTrashQuizList = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};
//**************************************************************
export const requestAdminTrashQuizListV2 = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v2/admin/quiz/trash', {
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  if (res.statusCode === 200) {
    return bodyString;
  } else if (res.statusCode === 401) {
    throw HTTPError(401);
  } 
};
//**************************************************************