import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
} from "./quiz.js";

import { adminAuthRegister, adminAuthLogin, adminUserDetails } from "./auth.js";

import { clear } from "./other.js";

beforeEach(() => {
  clear();
});

describe("Testing adminQuizInfo", () => {
  test("Valid input", () => {
    const JackUser = adminAuthRegister(
      "jack@hotmail.com",
      "123456ab",
      "Jack",
      "Harlow"
    );
    const QuizOne = adminQuizCreate(
      JackUser.authUserId,
      "Quiz One",
      "this is my first quiz"
    );
    expect(adminQuizInfo(JackUser.authUserId, QuizOne.quizId)).toStrictEqual({
      quizId: QuizOne.quizId,
      name: "Quiz One",
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: "this is my first quiz",
    });

    const QuizTwo = adminQuizCreate(
      JackUser.authUserId,
      "Quiz Two",
      "this is my second quiz"
    );
    expect(adminQuizInfo(JackUser.authUserId, QuizTwo.quizId)).toStrictEqual({
      quizId: QuizTwo.quizId,
      name: "Quiz Two",
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: "this is my second quiz",
    });
  });

  test("AuthUserId is not a valid user", () => {
    const JackUser = adminAuthRegister(
      "jack@hotmail.com",
      "123456ab",
      "Jack",
      "Harlow"
    );
    const QuizOne = adminQuizCreate(
      JackUser.authUserId,
      "Jack",
      "different quiz"
    );
    expect(adminQuizInfo("", QuizOne.quizId)).toStrictEqual({
      error: expect.any(String),
    });
    expect(adminQuizInfo("Angel", QuizOne.quizId)).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Quiz ID does not refer to a valid quiz", () => {
    const JackUser = adminAuthRegister(
      "jack@hotmail.com",
      "123456ab",
      "Jack",
      "Harlow"
    );
    const QuizOne = adminQuizCreate(
      JackUser.authUserId,
      "Jack",
      "different quiz"
    );
    expect(adminQuizInfo(JackUser.authUserId, "")).toStrictEqual({
      error: expect.any(String),
    });
    expect(adminQuizInfo(JackUser.authUserId, "S")).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Quiz ID does not refer to a quiz that this user owns", () => {
    const JackUser = adminAuthRegister(
      "jack@hotmail.com",
      "123456ab",
      "Jack",
      "Harlow"
    );
    const JacksQuiz = adminQuizCreate(
      JackUser.authUserId,
      "Jack",
      "Jacks quiz"
    );
    const TonyUser = adminAuthRegister(
      "tony@hotmail.com",
      "ab123456b",
      "Tony",
      "Stark"
    );
    const TonyQuiz = adminQuizCreate(TonyUser.authUserId, "Jack", "Tony quiz");
    expect(adminQuizInfo(JackUser.authUserId, TonyQuiz.quizId)).toStrictEqual({
      error: expect.any(String),
    });
    expect(adminQuizInfo(TonyUser.authUserId, JacksQuiz.quizId)).toStrictEqual({
      error: expect.any(String),
    });
  });
});

describe("Testing adminQuizCreate", () => {
  test("Test Valid Auth User ID", () => {
    const NewUser = adminAuthRegister(
      "email@gamil.com",
      "password1234",
      "Saarthak",
      "Sinha"
    );
    const quizId = adminQuizCreate(
      NewUser.authUserId,
      "quiz123",
      "description"
    );
    expect(quizId).toStrictEqual({ quizId: expect.any(Number) });
  });

  test("Test Invalid Auth User ID", () => {
    const quizId = adminQuizCreate("-111111", "Saarthak", "description");
    expect(quizId).toStrictEqual({ error: expect.any(String) });
  });

  test("Test Valid Name", () => {
    const NewUser = adminAuthRegister(
      "email@gamil.com",
      "password1234",
      "Saarthak",
      "Sinha"
    );
    const quizId = adminQuizCreate(
      NewUser.authUserId,
      "quiz123",
      "description"
    );
    expect(quizId).toStrictEqual({ quizId: expect.any(Number) });
  });

  test("Test Invalid Name", () => {
    const NewUser = adminAuthRegister(
      "email@gamil.com",
      "password1234",
      "Saarthak",
      "Sinha"
    );
    const quizId = adminQuizCreate(NewUser.authUserId, "???!!!", "description");
    expect(quizId).toStrictEqual({ error: expect.any(String) });
  });

  test("Test Invalid Samll Name Size", () => {
    const NewUser = adminAuthRegister(
      "email@gamil.com",
      "password1234",
      "Saarthak",
      "Sinha"
    );
    const quizId = adminQuizCreate(NewUser.authUserId, "ai", "description");
    expect(quizId).toStrictEqual({ error: expect.any(String) });
  });

  test("Test Invalid Large Name Size", () => {
    const NewUser = adminAuthRegister(
      "email@gamil.com",
      "password1234",
      "Saarthak",
      "Sinha"
    );
    const quizId = adminQuizCreate(
      NewUser.authUserId,
      "very long quiz name 123 aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "description"
    );
    expect(quizId).toStrictEqual({ error: expect.any(String) });
  });

  test("Test Invalid Repeated Name", () => {
    const NewUser = adminAuthRegister(
      "email@gamil.com",
      "password1234",
      "Saarthak",
      "Sinha"
    );
    const quizId = adminQuizCreate(
      NewUser.authUserId,
      "Saarthak",
      "description"
    );
    const quizId2 = adminQuizCreate(
      NewUser.authUserId,
      "Saarthak",
      "description"
    );
    expect(quizId2).toStrictEqual({ error: expect.any(String) });
  });

  test("Test Valid Description", () => {
    const NewUser = adminAuthRegister(
      "email@gamil.com",
      "password1234",
      "Saarthak",
      "Sinha"
    );
    const quizId = adminQuizCreate(NewUser.authUserId, "Saarthak", "");
    expect(quizId).toStrictEqual({ quizId: expect.any(Number) });
  });

  test("Test Invalid Description", () => {
    const NewUser = adminAuthRegister(
      "email@gamil.com",
      "password1234",
      "Saarthak",
      "Sinha"
    );
    const quizId = adminQuizCreate(
      NewUser.authUserId,
      "quiz123",
      "Very long description aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    expect(quizId).toStrictEqual({ error: expect.any(String) });
  });
});

describe("Testing adminQuizRemove", () => {
  test("Correct input", () => {
    const NewUser = adminAuthRegister(
      "jess@hotmail.com",
      "123456ab",
      "Jess",
      "Tran"
    );
    const QuizId = adminQuizCreate(NewUser.authUserId, "Jess", "description");
    expect(adminQuizRemove(NewUser.authUserId, QuizId.quizId)).toStrictEqual(
      {}
    );
  });

  test("Empty input", () => {
    expect(adminQuizRemove("", "")).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Invalid AuthUserId", () => {
    const NewUser = adminAuthRegister(
      "jess@hotmail.com",
      "123456ab",
      "Jess",
      "Tran"
    );
    const QuizId = adminQuizCreate(NewUser.authUserId, "Jess", "description");
    expect(adminQuizRemove("abc", QuizId.quizId)).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Invalid QuizId", () => {
    const NewUser = adminAuthRegister(
      "jess@hotmail.com",
      "123456ab",
      "Jess",
      "Tran"
    );
    const QuizId = adminQuizCreate(NewUser.authUserId, "Jess", "description");
    expect(adminQuizRemove(NewUser.authUserId, "abc")).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("QuizId does not refer to a quiz that this user owns", () => {
    const JessUser = adminAuthRegister(
      "jess@hotmail.com",
      "123456ab",
      "Jess",
      "Tran"
    );
    const AdamUser = adminAuthRegister(
      "adam@hotmail.com",
      "ab123456",
      "Adam",
      "Lee"
    );
    const JessQuizId = adminQuizCreate(
      JessUser.authUserId,
      "Jess",
      "description"
    );
    const AdamQuizId = adminQuizCreate(
      AdamUser.authUserId,
      "Jess",
      "description"
    );
    expect(
      adminQuizRemove(JessUser.authUserId, AdamQuizId.quizId)
    ).toStrictEqual({ error: expect.any(String) });
  });
});

describe("Testing adminQuizList", () => {
  test("Test Invalid Auth User ID", () => {
    const quizzes = adminQuizList("-111111");
    expect(quizzes).toStrictEqual({ error: expect.any(String) });
  });

  test("Test Valid Auth User ID", () => {
    const NewUser = adminAuthRegister(
      "Belinda@gamil.com",
      "1234hello",
      "Belinda",
      "Wong"
    );
    const Quiz1 = adminQuizCreate(
      NewUser.authUserId,
      "Quiz One",
      "description"
    );
    const Quiz2 = adminQuizCreate(
      NewUser.authUserId,
      "Quiz Two",
      "description"
    );
    const quizzes = adminQuizList(NewUser.authUserId);
    expect(quizzes).toStrictEqual({
      quizzes: [
        {
          quizId: Quiz1.quizId,
          name: "Quiz One",
        },
        {
          quizId: Quiz2.quizId,
          name: "Quiz Two",
        },
      ],
    });
  });

  describe("Testing AdminQuizNameUpdate", () => {
    test("Admin quiz name updated successfully", () => {
      const JackUser = adminAuthRegister(
        "jack@hotmail.com",
        "123456ab",
        "Jack",
        "Harlow"
      );
      const JacksQuiz = adminQuizCreate(
        JackUser.authUserId,
        "Jack",
        "Jacks quiz"
      );
      expect(
        adminQuizNameUpdate(JackUser.authUserId, JacksQuiz.quizId, "Gul")
      ).toStrictEqual({});
    });
    test("AuthUserId is not a valid user", () => {
      const JackUser = adminAuthRegister(
        "jack@hotmail.com",
        "123456ab",
        "Jack",
        "Harlow"
      );
      const QuizOne = adminQuizCreate(
        JackUser.authUserId,
        "Jack",
        "different quiz"
      );
      expect(adminQuizNameUpdate("", QuizOne.quizId, "Gul")).toStrictEqual({
        error: expect.any(String),
      });
      expect(adminQuizNameUpdate("Angel", QuizOne.quizId, "Gul")).toStrictEqual(
        { error: expect.any(String) }
      );
    });

    test("Quiz ID does not refer to a valid quiz", () => {
      const JackUser = adminAuthRegister(
        "jack@hotmail.com",
        "123456ab",
        "Jack",
        "Harlow"
      );
      const QuizOne = adminQuizCreate(
        JackUser.authUserId,
        "Jack",
        "different quiz"
      );
      expect(adminQuizNameUpdate(JackUser.authUserId, "", "Gul")).toStrictEqual(
        { error: expect.any(String) }
      );
      expect(
        adminQuizNameUpdate(JackUser.authUserId, "S", "Gul")
      ).toStrictEqual({ error: expect.any(String) });
    });

    test("Quiz ID does not refer to a quiz that this user owns", () => {
      const JackUser = adminAuthRegister(
        "jack@hotmail.com",
        "123456ab",
        "Jack",
        "Harlow"
      );
      const JacksQuiz = adminQuizCreate(
        JackUser.authUserId,
        "Jack",
        "Jacks quiz"
      );

      const TonyUser = adminAuthRegister(
        "tony@hotmail.com",
        "ab123456b",
        "Tony",
        "Stark"
      );
      const TonyQuiz = adminQuizCreate(
        TonyUser.authUserId,
        "Jack",
        "Tony quiz"
      );

      expect(
        adminQuizNameUpdate(JackUser.authUserId, TonyQuiz.quizId, "Gul")
      ).toStrictEqual({ error: expect.any(String) });
      expect(
        adminQuizNameUpdate(TonyUser.authUserId, JacksQuiz.quizId, "Gul")
      ).toStrictEqual({ error: expect.any(String) });
    });

    test("Test Invalid Name", () => {
      const JackUser = adminAuthRegister(
        "jack@hotmail.com",
        "123456ab",
        "Jack",
        "Harlow"
      );
      const JacksQuiz = adminQuizCreate(
        JackUser.authUserId,
        "Jack",
        "Jacks quiz"
      );
      expect(
        adminQuizNameUpdate(JackUser.authUserId, JacksQuiz.quizId, "&%^#$%")
      ).toStrictEqual({ error: expect.any(String) });
    });

    test("Test Invalid Samll Name Size", () => {
      const JackUser = adminAuthRegister(
        "jack@hotmail.com",
        "123456ab",
        "Jack",
        "Harlow"
      );
      const JacksQuiz = adminQuizCreate(
        JackUser.authUserId,
        "Jack",
        "Jacks quiz"
      );

      expect(
        adminQuizNameUpdate(JackUser.authUserId, JacksQuiz.quizId, "gu")
      ).toStrictEqual({ error: expect.any(String) });
    });

    test("Test Invalid Large Name Size", () => {
      const JackUser = adminAuthRegister(
        "jack@hotmail.com",
        "123456ab",
        "Jack",
        "Harlow"
      );
      const JacksQuiz = adminQuizCreate(
        JackUser.authUserId,
        "Jack",
        "Jacks quiz"
      );

      expect(
        adminQuizNameUpdate(
          JackUser.authUserId,
          JacksQuiz.quizId,
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        )
      ).toStrictEqual({ error: expect.any(String) });
    });

    test("Test Invalid Repeated Name", () => {
      const JackUser = adminAuthRegister(
        "jack@hotmail.com",
        "123456ab",
        "Jack",
        "Harlow"
      );
      const JacksQuiz = adminQuizCreate(
        JackUser.authUserId,
        "Jack",
        "Jacks quiz"
      );

      const TonyUser = adminAuthRegister(
        "tony@hotmail.com",
        "ab123456b",
        "Tony",
        "Stark"
      );
      const TonyQuiz = adminQuizCreate(
        TonyUser.authUserId,
        "Jack",
        "Tony quiz"
      );

      expect(
        adminQuizNameUpdate(JackUser.authUserId, JacksQuiz.quizId, "Jack")
      ).toStrictEqual({ error: expect.any(String) });
    });
  });
});

it("quiz timeLastEdited is updated when description is updated", async () => {
  // CONSTANTS USED IN TEST SUITE - START
  const EMAIL_1 = "jenny@hotmail.com";
  const PASSWORD_1 = "password1234567";

  const originalDescription = "A quiz about the UNSW CSE course COMP1511";
  const newDescription = "A quiz about the UNSW CSE course COMP1531";

  const WAIT_TIME = 2000;

  // CONSTANTS USED IN TEST SUITE - END

  // Step 1. Create user and then original quiz
  const userAdmin1 = adminAuthRegister(
    EMAIL_1,
    PASSWORD_1,
    "Jenny",
    "Anderson"
  );

  const originalQuiz = adminQuizCreate(
    userAdmin1.authUserId,
    "quiz2",
    originalDescription
  );

  // Step 2. Get timeLastEdited from quiz

  const quizInfoAtCreation = adminQuizInfo(
    userAdmin1.authUserId,
    originalQuiz.quizId
  );

  const timeLastEditedAtCreation = quizInfoAtCreation.timeLastEdited;

  // Step 3. Wait 2 seconds
  await new Promise((res) => setTimeout(res, WAIT_TIME));

  // Step 4. Update description of quiz

  const sameQuizWithNewDescription = adminQuizDescriptionUpdate(
    userAdmin1.authUserId,
    originalQuiz.quizId,
    newDescription
  );

  // Step 5. Get timeLastEdited from updated quiz

  const quizInfoAtUpdate = adminQuizInfo(
    userAdmin1.authUserId,
    originalQuiz.quizId
  );

  const timeLastEditedAtUpdate = quizInfoAtUpdate.timeLastEdited;

  // Step 6. Run test
  // Due to the wait, the time the quiz was updated is
  // always expected to be greater than when the quiz was created
  // the .toBe() jest function was not used as it may not always
  // be exactly the WAIT_TIME in difference, but it will
  // always be greater

  expect(timeLastEditedAtUpdate).toBeGreaterThan(timeLastEditedAtCreation);
});

describe("Testing adminQuizDescriptionUpdate", () => {
  // CONSTANTS USED IN TEST SUITE - START
  const EMAIL_1 = "jenny@hotmail.com";
  const PASSWORD_1 = "password1234567";
  const EMAIL_2 = "sandy@hotmail.com";
  const PASSWORD_2 = "password123456789";

  // CONSTANTS USED IN TEST SUITE - END

  test("quiz description is updated", () => {
    const originalDescription = "A quiz about the UNSW CSE course COMP1511";
    const newDescription = "A quiz about the UNSW CSE course COMP1531";

    const userAdmin1 = adminAuthRegister(
      EMAIL_1,
      PASSWORD_1,
      "Jenny",
      "Anderson"
    );

    const originalQuiz = adminQuizCreate(
      userAdmin1.authUserId,
      "quiz2",
      originalDescription
    );

    const sameQuizWithNewDescription = adminQuizDescriptionUpdate(
      userAdmin1.authUserId,
      originalQuiz.quizId,
      newDescription
    );

    expect(sameQuizWithNewDescription).toStrictEqual({});
  });

  test("AuthUserId is not a valid user", () => {
    const authUserId = -1;
    const quizId = 2;
    const description = "A quiz relating to git commands";
    expect(
      adminQuizDescriptionUpdate(authUserId, quizId, description)
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Quiz ID does not refer to a valid quiz", () => {
    const userAdmin1 = adminAuthRegister(
      EMAIL_1,
      PASSWORD_1,
      "Jenny",
      "Anderson"
    );

    const quizId = -1;
    const description = "A quiz relating to git commands";
    const adminQuizDescriptionUpdateTest = adminQuizDescriptionUpdate(
      userAdmin1.authUserId,
      quizId,
      description
    );

    expect(adminQuizDescriptionUpdateTest).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Quiz ID does not refer to a quiz that this user owns", () => {
    const userAdmin1 = adminAuthRegister(
      EMAIL_1,
      PASSWORD_1,
      "Jenny",
      "Anderson"
    );

    const userAdmin2 = adminAuthRegister(
      EMAIL_2,
      PASSWORD_2,
      "Sandy",
      "Johnson"
    );

    const quizId2 = adminQuizCreate(
      userAdmin2.authUserId,
      "quiz2",
      "A quiz about the UNSW CSE course COMP1511"
    );

    const description = "A quiz relating to git commands";

    const adminQuizDescriptionUpdateTest = adminQuizDescriptionUpdate(
      userAdmin1.authUserId,
      quizId2.quizId,
      description
    );

    expect(adminQuizDescriptionUpdateTest).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("Description is more than 100 characters in length", () => {
    const userAdmin1 = adminAuthRegister(
      EMAIL_1,
      PASSWORD_1,
      "Jenny",
      "Anderson"
    );

    const description =
      "A quiz relating to git. When working in git, or other version control systems, the concept of /'saving/' is a more nuanced process than saving in a word processor or other traditional file editing applications. The traditional software expression of /'saving/' is synonymous with the git term /'committing/'. A commit is the git equivalent of a /'save/'. Traditional saving should be thought of as a file system operation that is used to overwrite an existing file or write a new file. Alternatively, git committing is an operation that acts upon a collection of files and directories. commands. This was taken from ";

    const adminQuizCreateTest = adminQuizCreate(
      userAdmin1.authUserId,
      "quiz1",
      description
    );

    expect(adminQuizCreateTest).toStrictEqual({ error: expect.any(String) });
  });
});
