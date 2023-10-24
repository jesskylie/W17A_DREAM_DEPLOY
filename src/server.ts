import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  adminAuthRegister,
  adminUserDetails,
  adminAuthLogin,
  updatePassword,
  adminAuthLogout,
  adminUserDetailUpdate,
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
} from './quiz';
import { createQuizQuestion, deleteQuizQuestion, updateQuizQuestion, adminQuizQuestionMove } from './question';
import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

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
  const ret = echo(data);
  if ('error' in ret) {
    res.status(400);
  }
  return res.json(ret);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);
  if ('error' in response) {
    return res.status(400).json(response);
  }
  res.json(response);
});

// POST request to route /v1/admin/auth/login
// From swagger.yaml:
// Takes in information about an admin user to
// determine if they can log in to manage quizzes.
// This route is not relevant to guests who want to
// play a particular quiz, but is used for the
// creation of accounts of people who manage quizzes.

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

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminUserDetails(token);
  if ('error' in result) {
    return res.status(401).json(result);
  }
  res.json(result);
});

// POST request to route /v1/admin/quiz
// From swagger.yaml:
// Given basic details about a new quiz,
// create one for the logged in user

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;

  const response = adminQuizCreate(token, name, description);

  if ('error' in response) {
    console.log('error in response 1');
    if (response.errorCode === 400) {
      return res.status(400).json(response);
    } else if (response.errorCode === 401) {
      return res.status(401).json(response);
    }
  }
  res.json(response);
});

// POST request to route /v1/admin/user/details
// From swagger.yaml:
// Update the details of an admin user (non-password)

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;

  const response = adminUserDetailUpdate(token, email, nameFirst, nameLast);

  if ('detailsUpdateResponse' in response) {
    const testObj = response.detailsUpdateResponse;
    if ('error' in testObj) {
      const testStatusCode = testObj.errorCode;
      if (testStatusCode === 400) {
        return res.status(400).json(response);
      } else if (testStatusCode === 401) {
        return res.status(401).json(response);
      }
    }
  }
  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, newPassword, oldPassword } = req.body;
  const response = updatePassword(token, newPassword, oldPassword);

  if ('error' in response) {
    console.log('error in response 2');
    if (response.errorCode === 400) {
      return res.status(400).json(response);
    } else if (response.errorCode === 401) {
      return res.status(401).json(response);
    }
  }
  res.json(response);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = newClear();
  if ('error' in response) {
    return res.status(400).json(response);
  }
  res.status(200).json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizList(token);
  if ('error' in result) {
    return res.status(RESPONSE_ERROR_401).json({ error: result.error });
  }
  res.status(RESPONSE_OK_200).json(result);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizids = req.query.quizids as string[];
  const quizIds = quizids.map(Number);
  const result = adminTrashQuizEmpty(token, quizIds);
  if ('error' in result) {
    console.log('error in response 5');
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
    console.log('error in response 3');
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

app.post('/v1/admin/quiz/:quizId/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  console.log(quizId);
  const { token, questionBody } = req.body;

  const response = createQuizQuestion(token, questionBody, quizId);

  if ('createQuizQuestionResponse' in response) {
    const testObj = response.createQuizQuestionResponse;

    if ('error' in testObj) {
      const testErrorCode = testObj.errorCode;
      if (testErrorCode === RESPONSE_ERROR_400) {
        return res.status(RESPONSE_ERROR_400).json(response);
      } else if (testErrorCode === RESPONSE_ERROR_401) {
        return res.status(RESPONSE_ERROR_401).json(response);
      } else if (testErrorCode === RESPONSE_ERROR_403) {
        return res.status(RESPONSE_ERROR_403).json(response);
      }
    }
  }
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.body.token;
  const quizId = parseInt(req.params.quizid);
  const result = adminTrashQuizRestore(token, quizId);
  if ('error' in result) {
    console.log('error in response 4');
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

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
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
});

app.put('/v1/admin/quiz/:quizId/question/:questionId', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const response = updateQuizQuestion(quizId, questionId, token, questionBody);
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

// ***********************************************************************

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

app.put('/v1/admin/quiz/:quizId/question/:questionId/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizId);
  const questionId = parseInt(req.params.questionId);
  const { token, newPosition } = req.body;
  const response = adminQuizQuestionMove(token, quizId, questionId, newPosition);

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

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
