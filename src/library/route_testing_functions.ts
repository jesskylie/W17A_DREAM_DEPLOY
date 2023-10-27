// Do not delete this file _
// All tests passing
// All lint checks passing
import request from 'sync-request-curl';
import config from '../config.json';

import { WAIT_TIME } from './constants';

import {
  requestAdminQuizCreateReturn,
  requestAdminQuizListReturn,
  requestAdminQuizInfoReturn,
} from './interfaces';

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

export const requestAdminQuizList = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

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
