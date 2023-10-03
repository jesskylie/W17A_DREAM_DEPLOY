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
      "Jack",
      "this is my first quiz"
    );
    expect(adminQuizInfo(JackUser.authUserId, QuizOne.quizId)).toStrictEqual({
      quizId: QuizOne.quizId,
      name: QuizOne.name,
      timeCreated: QuizOne.timeCreated,
      timeLastEdited: QuizOne.timeLastEdited,
      description: QuizOne.description,
    });

    const QuizTwo = adminQuizCreate(
      JackUser.authUserId,
      "Jack",
      "this is my second quiz"
    );
    expect(adminQuizInfo(JackUser.authUserId, QuizTwo.quizId)).toStrictEqual({
      quizId: QuizTwo.quizId,
      name: QuizTwo.name,
      timeCreated: QuizTwo.timeCreated,
      timeLastEdited: QuizTwo.timeLastEdited,
      description: QuizTwo.description,
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
      error: "AuthUserId and QuizId cannot be empty",
    });
    expect(adminQuizInfo("Angel", QuizOne.quizId)).toStrictEqual({
      error: "AuthUserId is not a valid user",
    });
  });

  test("Quiz ID does not refer to a valid quiz", () => {
    const JackUser = adminAuthRegister(
      "jack@hotmail.com",
      "123456ab",
      "Jack",
      "Harlow"
    );
    const QuizOne = adminQuizCreate(JackUser.quizId, "Jack", "different quiz");
    expect(adminQuizInfo(JackUser.authUserId, "")).toStrictEqual({
      error: "AuthUserId and QuizId cannot be empty",
    });
    expect(adminQuizInfo(JackUser.authUserId, "S")).toStrictEqual({
      error: "QuizId is invalid",
    });
  });

  test("Quiz ID does not refer to a quiz that this user owns", () => {
    const JackUser = adminAuthRegister(
      "jack@hotmail.com",
      "123456ab",
      "Jack",
      "Harlow"
    );
    const JacksQuiz = adminQuizCreate(JackUser.quizId, "Jack", "Jacks quiz");
    const TonyUser = adminAuthRegister(
      "tony@hotmail.com",
      "ab123456b",
      "Tony",
      "Stark"
    );
    const TonyQuiz = adminQuizCreate(TonyUser.quizId, "Jack", "Tony quiz");
    expect(adminQuizInfo(JackUser.authUserId, TonyQuiz.quizId)).toStrictEqual({
      error: "QuizId does not match authUserId",
    });
    expect(adminQuizInfo(TonyUser.authUserId, JacksQuiz.quizId)).toStrictEqual({
      error: "QuizId does not match authUserId",
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
      "password",
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
      "password",
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
    expect(quizId).toStrictEqual({ error: expect.any(String) });
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
      error: "AuthUserId and QuizId cannot be empty",
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
      error: "AuthUserId is not a valid user",
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
      error: "QuizId is invalid",
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
    ).toStrictEqual({ error: "QuizId does not match authUserId" });
  });
});

describe("Testing adminQuizList", () => {
  test("Test Valid Auth User ID", () => {
    const NewUser = adminAuthRegister(
      "Belinda@gamil.com",
      "password",
      "Belinda",
      "Wong"
    );
    const Quiz1 = adminQuizCreate(NewUser.authUserId, "Jess", "description");
    const Quiz2 = adminQuizCreate(NewUser.authUserId, "Jess", "description");
    const quizzes = adminQuizList(NewUser.authUserId);
    expect(quizzes).toStrictEqual({
      quizzes: [
        {
          quizId: Quiz1.quizId,
          name: Quiz1.name,
        },
        {
          quizId: Quiz2.quizId,
          name: Quiz2.name,
        },
      ],
    });

    test("Test Invalid Auth User ID", () => {
      const quizzes = adminQuizList("-111111");
      expect(quizzes).toStrictEqual({ error: expect.any(String) });
    });
    
  });

describe('Testing AdminQuizNameUpdate', () => {

  test('Admin quiz name updated successfully', () => {
    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const JacksQuiz = adminQuizCreate(JackUser.quizId, 'Jack', 'Jacks quiz');
    expect (adminQuizNameUpdate(JackUser.authUserId, JackUser.quizId, 'Gul')).toStrictEqual( {error: expect.any(String)} );

  });
  test ('AuthUserId is not a valid user', () => {
    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const QuizOne = adminQuizCreate(JackUser.authUserId, 'Jack', 'different quiz');
    expect (adminQuizNameUpdate('', QuizOne.quizId, 'Gul')).toStrictEqual( {error: expect.any(String)} );
    expect (adminQuizNameUpdate('Angel', QuizOne.quizId, 'Gul')).toStrictEqual( {error: expect.any(String)} );
  });
  
  test ('Quiz ID does not refer to a valid quiz', () => {
    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const QuizOne = adminQuizCreate(JackUser.quizId, 'Jack', 'different quiz');
    expect (adminQuizNameUpdate(JackUser.authUserId, '', 'Gul')).toStrictEqual( {error: expect.any(String)} );
    expect (adminQuizNameUpdate(JackUser.authUserId, 'S', 'Gul')).toStrictEqual( {error: expect.any(String)} );
  });
  
  test ('Quiz ID does not refer to a quiz that this user owns', () => {

    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const JacksQuiz = adminQuizCreate(JackUser.quizId, 'Jack', 'Jacks quiz');

    const TonyUser = adminAuthRegister('tony@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const TonyQuiz = adminQuizCreate(TonyUser.quizId, 'Jack', 'Tony quiz');
 
    expect (adminQuizNameUpdate(JackUser.authUserId, TonyQuiz.quizId, 'Gul')).toStrictEqual( {error: expect.any(String)} );
    expect (adminQuizNameUpdate(TonyUser.authUserId, JacksQuiz.quizId, 'Gul')).toStrictEqual( {error: expect.any(String)} );
  });

  test('Test Invalid Name', () => {

    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const JacksQuiz = adminQuizCreate(JackUser.quizId, 'Jack', 'Jacks quiz');

    expect(adminQuizNameUpdate(JackUser.adminUserId, JacksQuiz.quizId, '&%^#$%')).toStrictEqual({error: expect.any(String)});
  });

  test('Test Invalid Samll Name Size', () => {

    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const JacksQuiz = adminQuizCreate(JackUser.quizId, 'Jack', 'Jacks quiz');

    expect(adminQuizNameUpdate(JackUser.adminUserId, JacksQuiz.quizId, 'gu')).toStrictEqual({error: expect.any(String)});
  });
  
  test('Test Invalid Large Name Size', () => {
   
    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const JacksQuiz = adminQuizCreate(JackUser.quizId, 'Jack', 'Jacks quiz');

    expect(adminQuizNameUpdate(JackUser.adminUserId, JacksQuiz.quizId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toStrictEqual({error: expect.any(String)});;

  });

  test('Test Invalid Repeated Name', () => {
    const JackUser = adminAuthRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const JacksQuiz = adminQuizCreate(JackUser.quizId, 'Jack', 'Jacks quiz');

    const TonyUser = adminAuthRegister('tony@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const TonyQuiz = adminQuizCreate(TonyUser.quizId, 'Jack', 'Tony quiz');
 
    expect (adminQuizNameUpdate(JackUser.authUserId, JackUser.quizId, 'Tony')).toStrictEqual( {error: expect.any(String)} );
  });
});

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
