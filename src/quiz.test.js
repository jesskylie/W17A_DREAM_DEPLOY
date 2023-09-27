import { adminAuthRegister, adminAuthLogin, adminUserDetails } from "./auth.js";

import { adminQuizDescriptionUpdate } from "./quiz.js";

import { clear } from "./other.js";

beforeEach(() => {
  clear();
});

describe("Testing adminQuizDescriptionUpdate", () => {
  test("AuthUserId is not a valid user", () => {
    const authUserId = -1;
    const quizId = 2;
    const description = "A quiz relating to git commands";
    expect(
      adminQuizDescriptionUpdate(authUserId, quizId, description)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Quiz ID does not refer to a valid quiz", () => {
    const authUserId = adminAuthLogin("paul@gmail.com", "Password1234567");
    const quizId = -1;
    const description = "A quiz relating to git commands";
    expect(
      adminQuizDescriptionUpdate(authUserId, quizId, description)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Quiz ID does not refer to a quiz that this user owns", () => {
    const authUserId = adminAuthLogin("paul@gmail.com", "Password1234567");
    const quizId = -1;
    const description = "A quiz relating to git commands";
    expect(
      adminQuizDescriptionUpdate(authUserId, quizId, description)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Description is more than 100 characters in length", () => {
    const authUserId = adminAuthLogin("paul@gmail.com", "Password1234567");
    const quizzes = adminQuizList(authUserId);
    const quizId = quizzes[0].quizId;
    const description =
      "A quiz relating to git. When working in git, or other version control systems, the concept of /'saving/' is a more nuanced process than saving in a word processor or other traditional file editing applications. The traditional software expression of /'saving/' is synonymous with the git term /'committing/'. A commit is the git equivalent of a /'save/'. Traditional saving should be thought of as a file system operation that is used to overwrite an existing file or write a new file. Alternatively, git committing is an operation that acts upon a collection of files and directories. commands. This was taken from ";
    expect(
      adminQuizDescriptionUpdate(authUserId, quizId, description)
    ).toStrictEqual({ error: expect.any(String) });
  });
});
