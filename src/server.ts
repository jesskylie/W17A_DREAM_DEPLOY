import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  adminAuthRegister,
  adminUserDetails,
  adminUserDetailsV2,
  adminAuthLogin,
  updatePassword,
  updatePasswordV2,
  adminAuthLogout,
  adminAuthLogoutV2,
  adminUserDetailUpdate,
  adminUserDetailUpdateV2,
} from './auth';
import { newClear } from './other';
import {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizList,
  adminQuizRemove,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminTrashQuizRestore,
  adminTrashQuizEmpty,
  getQuizzesInTrashForLoggedInUser,
  adminQuizTransfer,
  adminTrashQuizRestoreV2,
  adminTrashQuizEmptyV2,
  adminQuizTransferV2,
  adminTrashQuizListV2,
  adminQuizListV2
} from './quiz';
import {
  adminQuizCreateV2,
  adminQuizRemoveV2,
  adminQuizInfoV2,
  adminQuizNameUpdateV2,
  adminQuizDescriptionUpdateV2,
  adminQuizThumbnailUrlUpdate,
  adminQuizGetSessionStatus,
} from './quizV2';

import {
  createQuizQuestion,
  createQuizQuestionV2,
  deleteQuizQuestion,
  updateQuizQuestion,
  adminQuizQuestionMove,
  duplicateQuestion,
  updateQuizQuestionV2,
  duplicateQuestionV2,
  adminQuizQuestionMoveV2,
  deleteQuizQuestionV2,
} from './question';
import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

import {
  playerCreate,
  playerStatus,
  sessionFinalResult,
  startNewSession,
  updateSessionState,
  viewAllSessions,
} from './session';

import { getResultsOfAnswers, submissionOfAnswers } from './answers';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use(
  '/docs',
  sui.serve,
  sui.setup(YAML.parse(file), {
    swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' },
  })
);

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// ============================================================================
// =================== v2 ROUTES BELOW THIS LINE =======================
// ============================================================================

// --------------------------- V2 POST REQUESTS - START --------------------------

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  res.json(adminAuthLogoutV2(token));
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.headers.token as string;

  const quizId = parseInt(req.params.quizid);

  const { questionBody } = req.body;

  res.json(createQuizQuestionV2(token, questionBody, quizId));
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { name, description } = req.body;
  res.json(adminQuizCreateV2(token, name, description));
});

app.post(
  '/v2/admin/quiz/:quizid/question/:questionid/duplicate',
  (req: Request, res: Response) => {
    const token = req.headers.token as string;
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    res.json(duplicateQuestionV2(quizId, questionId, token));
  }
);

app.post(
  '/v1/admin/quiz/:quizid/session/start',
  (req: Request, res: Response) => {
    const token = req.headers.token as string;
    const quizId = parseInt(req.params.quizid);
    const { autoStartNum } = req.body;
    res.json(startNewSession(quizId, token, autoStartNum));
  }
);

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminTrashQuizRestoreV2(token, quizId);
  res.json(result);
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const userEmail = req.body.userEmail;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizTransferV2(token, userEmail, quizId);
  res.json(result);
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  res.json(playerCreate(sessionId, name));
});

// --------------------------- V2 POST REQUESTS - END ----------------------------s

// --------------------------- V2 GET REQUESTS - START ---------------------------

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  res.json(adminUserDetailsV2(token));
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  res.json(adminQuizInfoV2(token, quizId));
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const result = adminTrashQuizListV2(token);
  res.json(result);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const result = adminQuizListV2(token);
  res.json(result);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const result = viewAllSessions(token, quizId);
  res.json(result);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const result = adminQuizListV2(token);
  res.json(result);
});

app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const result = playerStatus(playerId);
  res.json(result);
});

app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const result = sessionFinalResult(playerId);
  res.json(result);
});

// --------------------------- V2 GET REQUESTS - END -----------------------------

// --------------------------- V2 PUT REQUESTS - START ---------------------------

app.put(
  '/v1/admin/quiz/:quizid/session/:sessionid',
  (req: Request, res: Response) => {
    const token = req.headers.token as string;
    const quizId = parseInt(req.params.quizid);
    const sessionId = parseInt(req.params.sessionid);
    const { action } = req.body;
    const result = updateSessionState(quizId, sessionId, token, action);
    res.json(result);
  }
);

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { email, nameFirst, nameLast } = req.body;

  res.json(adminUserDetailUpdateV2(token, email, nameFirst, nameLast));
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { oldPassword, newPassword } = req.body;

  res.json(updatePasswordV2(token, oldPassword, newPassword));
});

app.put(
  '/v2/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const token = req.headers.token as string;
    const { questionBody, thumbnailUrl } = req.body;
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    res.json(
      updateQuizQuestionV2(
        quizId,
        questionId,
        token,
        questionBody,
        thumbnailUrl
      )
    );
  }
);

app.put(
  '/v2/admin/quiz/:quizid/question/:questionid/move',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const token = req.headers.token as string;
    const newPosition = req.body;
    res.json(adminQuizQuestionMoveV2(token, quizId, questionId, newPosition));
  }
);

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { name } = req.body;
  const quizId = parseInt(req.params.quizid);
  res.json(adminQuizNameUpdateV2(token, quizId, name));
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { description } = req.body;
  const quizId = parseInt(req.params.quizid);
  res.json(adminQuizDescriptionUpdateV2(token, quizId, description));
});

// --------------------------- V2 PUT REQUESTS - END -----------------------------

// --------------------------- V2 DELETE REQUESTS - START ------------------------
app.delete(
  '/v2/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const token = req.headers.token as string;
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    res.json(deleteQuizQuestionV2(token, quizId, questionId));
  }
);

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  res.json(adminQuizRemoveV2(token, quizId));
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizids = req.query.quizIds as string;
  const quizIds = JSON.parse(quizids);
  const result = adminTrashQuizEmptyV2(token, quizIds);
  res.json(result);
});
// --------------------------- DELETE REQUESTS - END --------------------------

// ============================================================================
// =================== v2 ROUTES ABOVE THIS LINE =======================
// ============================================================================

// ============================================================================
// =================== v1 ROUTES BELOW THIS LINE =======================
// ============================================================================

// --------------------------- V1 POST REQUESTS - START --------------------------

// POST request to route /v1/admin/auth/login
// From swagger.yaml:
// Takes in information about an admin user to
// determine if they can log in to manage quizzes.
// This route is not relevant to guests who want to
// play a particular quiz, but is used for the
// creation of accounts of people who manage quizzes.

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in response) {
    return res.status(400).json(response);
  }
  res.json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = adminAuthLogin(email, password);

  if ('error' in response) {
    return res.status(400).json(response);
  }
  res.json(response);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const response = adminAuthLogout(token);

  if ('error' in response) {
    return res.status(401).json(response);
  }
  res.json(response);
});

// POST request to route /v1/admin/quiz
// From swagger.yaml:
// Given basic details about a new quiz,
// create one for the logged in user

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const response = adminQuizCreate(token, name, description);

  if ('error' in response) {
    if (response.errorCode === 400) {
      return res.status(400).json({ error: response.error });
    } else if (response.errorCode === 401) {
      return res.status(401).json({ error: response.error });
    }
  }
  res.json(response);
});

app.post('/v1/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const { token, questionBody } = req.body;
  const response = createQuizQuestion(token, questionBody, quizId);

  if ('createQuizQuestionResponse' in response) {
    const testObj = response.createQuizQuestionResponse;
    if ('error' in testObj) {
      const testErrorCode = testObj.errorCode;
      if (testErrorCode === RESPONSE_ERROR_400) {
        if ('error' in response.createQuizQuestionResponse) {
          return res
            .status(RESPONSE_ERROR_400)
            .json({ error: response.createQuizQuestionResponse.error });
        }
      } else if (testErrorCode === RESPONSE_ERROR_401) {
        if ('error' in response.createQuizQuestionResponse) {
          return res
            .status(RESPONSE_ERROR_401)
            .json({ error: response.createQuizQuestionResponse.error });
        }
      } else if (testErrorCode === RESPONSE_ERROR_403) {
        if ('error' in response.createQuizQuestionResponse) {
          return res
            .status(RESPONSE_ERROR_403)
            .json({ error: response.createQuizQuestionResponse.error });
        }
      }
    }
  }
  res.json(response.createQuizQuestionResponse);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.body.token;
  const quizId = parseInt(req.params.quizid);
  const result = adminTrashQuizRestore(token, quizId);

  if ('error' in result) {
    if (result.errorCode === RESPONSE_ERROR_400) {
      return res.status(RESPONSE_ERROR_400).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_401) {
      return res.status(RESPONSE_ERROR_401).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_403) {
      return res.status(RESPONSE_ERROR_403).json({ error: result.error });
    }
  }
  res.status(RESPONSE_OK_200).json(result);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token = req.body.token;
  const userEmail = req.body.userEmail;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizTransfer(token, userEmail, quizId);

  if ('error' in result) {
    if (result.errorCode === RESPONSE_ERROR_400) {
      return res.status(RESPONSE_ERROR_400).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_401) {
      return res.status(RESPONSE_ERROR_401).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_403) {
      return res.status(RESPONSE_ERROR_403).json({ error: result.error });
    }
  }
  res.status(RESPONSE_OK_200).json(result);
});

app.post(
  '/v1/admin/quiz/:quizId/question/:questionId/duplicate',
  (req: Request, res: Response) => {
    const { token } = req.body;
    const quizId = parseInt(req.params.quizId);
    const questionId = parseInt(req.params.questionId);
    const response = duplicateQuestion(quizId, questionId, token);
    if ('error' in response) {
      if (response.errorCode === RESPONSE_ERROR_400) {
        return res.status(RESPONSE_ERROR_400).json({ error: response.error });
      } else if (response.errorCode === RESPONSE_ERROR_401) {
        return res.status(RESPONSE_ERROR_401).json({ error: response.error });
      } else if (response.errorCode === RESPONSE_ERROR_403) {
        return res.status(RESPONSE_ERROR_403).json({ error: response.error });
      }
    }
    res.status(RESPONSE_OK_200).json(response);
  }
);

// --------------------------- V1 POST REQUESTS - END --------------------------

// --------------------------- V1 GET REQUESTS - START --------------------------

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminUserDetails(token);

  if ('error' in result) {
    return res.status(401).json(result);
  }
  res.json(result);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizList(token);

  if ('error' in result) {
    return res.status(RESPONSE_ERROR_401).json({ error: result.error });
  }
  res.status(RESPONSE_OK_200).json(result);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = getQuizzesInTrashForLoggedInUser(token);

  if ('error' in result) {
    return res.status(RESPONSE_ERROR_401).json({ error: result.error });
  }
  res.status(RESPONSE_OK_200).json(result);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizInfo(token, quizId);

  if ('error' in result) {
    if (result.errorCode === RESPONSE_ERROR_400) {
      return res.status(RESPONSE_ERROR_400).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_401) {
      return res.status(RESPONSE_ERROR_401).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_403) {
      return res.status(RESPONSE_ERROR_403).json({ error: result.error });
    }
  }
  res.status(RESPONSE_OK_200).json(result);
});

// Iteration 3 v1 route
app.get(
  '/v1/admin/quiz/:quizid/session/:sessionid',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizid);
    const sessionId = parseInt(req.params.sessionid);
    const token = req.headers.token as string;

    const response = adminQuizGetSessionStatus(quizId, sessionId, token);

    res.json(response);
  }
);

app.get('/v1/player/:playerid/question/:questionposition/result',
  (req: Request, res: Response) => {
    const playerId = parseInt(req.params.playerid);
    const questionPosition = parseInt(req.params.questionposition);
    res.json(getResultsOfAnswers(playerId, questionPosition));
  }
);

// --------------------------- V1 GET REQUESTS - END --------------------------

// --------------------------- V1 PUT REQUESTS - START --------------------------

// PUT request to route /v1/admin/user/details
// From swagger.yaml:
// Update the details of an admin user (non-password)
app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { answerIds } = req.body;
  const questionPosition = parseInt(req.params.questionposition);
  const result = submissionOfAnswers(playerId, answerIds, questionPosition);
  res.json(result);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;

  const response = adminUserDetailUpdate(token, email, nameFirst, nameLast);

  if ('detailsUpdateResponse' in response) {
    const testObj = response.detailsUpdateResponse;
    if ('error' in testObj) {
      const testStatusCode = testObj.errorCode;
      if (testStatusCode === 400) {
        // return res.status(400).json(response);
        return res
          .status(400)
          .json({ error: response.detailsUpdateResponse.error });
      } else if (testStatusCode === 401) {
        // return res.status(401).json(response);
        return res
          .status(401)
          .json({ error: response.detailsUpdateResponse.error });
      }
    }
  }
  res.json(response.detailsUpdateResponse);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = updatePassword(token, oldPassword, newPassword);

  if ('error' in response) {
    if (response.errorCode === 400) {
      // return res.status(400).json(response);
      return res.status(400).json({ error: response.error });
    } else if (response.errorCode === 401) {
      // return res.status(401).json(response);
      return res.status(401).json({ error: response.error });
    }
  }
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { token, name } = req.body;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizNameUpdate(token, quizId, name);

  if ('error' in response) {
    if (response.errorCode === RESPONSE_ERROR_400) {
      return res.status(RESPONSE_ERROR_400).json({ error: response.error });
    } else if (response.errorCode === RESPONSE_ERROR_401) {
      return res.status(RESPONSE_ERROR_401).json({ error: response.error });
    } else if (response.errorCode === RESPONSE_ERROR_403) {
      return res.status(RESPONSE_ERROR_403).json({ error: response.error });
    }
  }
  res.status(RESPONSE_OK_200).json(response);
});

// Iteration 3 v1 route
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const { imgUrl } = req.body;

  const response = adminQuizThumbnailUrlUpdate(quizId, token, imgUrl);

  res.json(response);
});

app.put(
  '/v1/admin/quiz/:quizId/question/:questionId',
  (req: Request, res: Response) => {
    const { token, questionBody } = req.body;
    const quizId = parseInt(req.params.quizId);
    const questionId = parseInt(req.params.questionId);
    const response = updateQuizQuestion(
      quizId,
      questionId,
      token,
      questionBody
    );
    if ('error' in response) {
      if (response.errorCode === RESPONSE_ERROR_400) {
        return res.status(RESPONSE_ERROR_400).json({ error: response.error });
      } else if (response.errorCode === RESPONSE_ERROR_401) {
        return res.status(RESPONSE_ERROR_401).json({ error: response.error });
      } else if (response.errorCode === RESPONSE_ERROR_403) {
        return res.status(RESPONSE_ERROR_403).json({ error: response.error });
      }
    }
    res.status(RESPONSE_OK_200).json(response);
  }
);

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { token, quizid, description } = req.body;

  const response = adminQuizDescriptionUpdate(token, quizid, description);

  if ('error' in response) {
    if (response.errorCode === RESPONSE_ERROR_400) {
      return res.status(RESPONSE_ERROR_400).json({ error: response.error });
    } else if (response.errorCode === RESPONSE_ERROR_401) {
      return res.status(RESPONSE_ERROR_401).json({ error: response.error });
    } else if (response.errorCode === RESPONSE_ERROR_403) {
      return res.status(RESPONSE_ERROR_403).json({ error: response.error });
    }
  }
  res.status(RESPONSE_OK_200).json(response);
});

app.put(
  '/v1/admin/quiz/:quizId/question/:questionId/move',
  (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizId);
    const questionId = parseInt(req.params.questionId);
    const { token, newPosition } = req.body;
    const response = adminQuizQuestionMove(
      token,
      quizId,
      questionId,
      newPosition
    );

    if ('error' in response) {
      if (response.errorCode === RESPONSE_ERROR_400) {
        return res.status(RESPONSE_ERROR_400).json({ error: response.error });
      } else if (response.errorCode === RESPONSE_ERROR_401) {
        return res.status(RESPONSE_ERROR_401).json({ error: response.error });
      } else if (response.errorCode === RESPONSE_ERROR_403) {
        return res.status(RESPONSE_ERROR_403).json({ error: response.error });
      }
    }
    res.status(RESPONSE_OK_200).json(response);
  }
);

// --------------------------- V1 PUT REQUESTS - END --------------------------

// --------------------------- V1 DELETE REQUESTS - START --------------------------

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = newClear();
  if ('error' in response) {
    return res.status(400).json(response);
  }
  res.status(200).json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizids = req.query.quizIds as string;
  const quizIds = JSON.parse(quizids);
  const result = adminTrashQuizEmpty(token, quizIds);
  if ('error' in result) {
    if (result.errorCode === RESPONSE_ERROR_400) {
      return res.status(RESPONSE_ERROR_400).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_401) {
      return res.status(RESPONSE_ERROR_401).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_403) {
      return res.status(RESPONSE_ERROR_403).json({ error: result.error });
    }
  }
  res.status(RESPONSE_OK_200).json(result);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizRemove(token, quizId);

  if ('error' in result) {
    if (result.errorCode === RESPONSE_ERROR_400) {
      return res.status(RESPONSE_ERROR_400).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_401) {
      return res.status(RESPONSE_ERROR_401).json({ error: result.error });
    } else if (result.errorCode === RESPONSE_ERROR_403) {
      return res.status(RESPONSE_ERROR_403).json({ error: result.error });
    }
  }
  res.status(RESPONSE_OK_200).json(result);
});

app.delete(
  '/v1/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const token = req.query.token as string;
    const quizId = parseInt(req.params.quizid);
    const questionId = parseInt(req.params.questionid);
    const result = deleteQuizQuestion(token, quizId, questionId);
    if ('error' in result) {
      if (result.errorCode === RESPONSE_ERROR_400) {
        return res.status(RESPONSE_ERROR_400).json({ error: result.error });
      } else if (result.errorCode === RESPONSE_ERROR_401) {
        return res.status(RESPONSE_ERROR_401).json({ error: result.error });
      } else if (result.errorCode === RESPONSE_ERROR_403) {
        return res.status(RESPONSE_ERROR_403).json({ error: result.error });
      }
    }
    res.status(RESPONSE_OK_200).json(result);
  }
);

// --------------------------- V1 DELETE REQUESTS - END --------------------------

// ============================================================================
// =================== v1 ROUTES ABOVE THIS LINE =======================
// ============================================================================

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
  404 Not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
