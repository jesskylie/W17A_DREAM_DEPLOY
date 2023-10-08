// This is a test message for pull everything in testMaster to local vscode
import { adminAuthRegister, adminAuthLogin, adminUserDetails } from "./auth.js";

import { clear } from "./other.js";

beforeEach(() => {
  clear();
});

describe("Testing adminAuthLogin", () => {
  test("email address does not exist", () => {
    expect(adminAuthLogin("jess@hotmail.com", "123456AB")).toStrictEqual({
      error: expect.any(String),
    });
  });

  test("password is incorrect for given email", () => {
    const NewUser = adminAuthRegister(
      "jess@hotmail.com",
      "123456ab",
      "Jess",
      "Tran"
    );
    const login = adminAuthLogin("jess@hotmail.com", "");
    expect(login).toStrictEqual({ error: expect.any(String) });
  });

  test("correct input", () => {
    const NewUser = adminAuthRegister(
      "jess@hotmail.com",
      "123456ab",
      "Jess",
      "Tran"
    );
    const login = adminAuthLogin("jess@hotmail.com", "123456ab");
    expect(login).toStrictEqual({ authUserId: expect.any(Number) });
  });
});

describe("Testing adminAuthRegister", () => {
  test("Valid: Admin registered", () => {
    expect(
      adminAuthRegister("any@gmail.com", "1234PassWord", "gul", "Jain")
    ).toStrictEqual({ authUserId: expect.any(Number) });
    expect(
      adminAuthRegister("jess@gmail.com", "1234PassWord", "Jess", "Tran")
    ).toStrictEqual({ authUserId: expect.any(Number) });
  });

  test("Invalid Email address", () => {
    expect(adminAuthRegister("", "1234PassWord", "gul", "Jain")).toStrictEqual({
      error: expect.any(String),
    });
    expect(
      adminAuthRegister("sss", "1234PassWord", "Jess", "Tran")
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Email address is already in use ", () => {
    expect(
      adminAuthRegister("jess@hotmail.com", "1234PassWord", "gul", "Jain")
    ).toStrictEqual({ authUserId: expect.any(Number) });
    expect(
      adminAuthRegister("jess@hotmail.com", "1234PassWord", "Jess", "Tran")
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Invalid: NameFirst cannot contain numbers", () => {
    expect(
      adminAuthRegister("any@gmail.com", "1234Password", "gul01", "Surname")
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Invalid: NameLast cannot contain numbers", () => {
    expect(
      adminAuthRegister("any@gmail.com", "1234Password", "gul", "surname09")
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Invalid: NameFirst cannot contain symbols", () => {
    expect(
      adminAuthRegister("any@gmail.com", "1234Password", "gul@%", "surname")
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Invalid: NameLast cannot contain symbols", () => {
    expect(
      adminAuthRegister("any@gmail.com", "1234Password", "gul", "surname%%")
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Invalid: NameFirst must have more than 2 and less than 20 characters", () => {
    expect(
      adminAuthRegister("any@gmail.com", "1234Password", "a", "surname")
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Invalid: NameLast must have more than 2  and less than 20 characters", () => {
    expect(
      adminAuthRegister("any@gmail.com", "1234Password", "name", "r")
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Invalid: NameFirst must have more than 2  and less than 20 characters", () => {
    expect(
      adminAuthRegister(
        "any@gmail.com",
        "1234Password",
        "nameshouldbelessthantwenty",
        "r"
      )
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Invalid: NameLast must have more than 2  and less than 20 characters", () => {
    expect(
      adminAuthRegister(
        "any@gmail.com",
        "1234Password",
        "name",
        "surnameshouldbelessthantwenty"
      )
    ).toStrictEqual({ error: expect.any(String) });
  });
  test("Invalid: Password is less than 8 characters", () => {
    expect(
      adminAuthRegister("any@gmail.com", "1Pass", "name", "surname")
    ).toStrictEqual({ error: expect.any(String) });
  });

  test("Invalid: Password must contain at least one number and at least one letter", () => {
    expect(
      adminAuthRegister("any@gmail.com", "invalidpassword", "name", "surname")
    ).toStrictEqual({ error: expect.any(String) });
  });
});

describe("Testing adminUserDetails", () => {
  test("Test Valid Auth User ID", () => {
    const NewUser = adminAuthRegister("jess@gmail.com", "1234PassWord", "Jess", "Tran");
    const NewUser2 = adminAuthRegister("angel@gmail.com", "1234PassWord", "Angel", "Tran");
    const result = {
      user: {
        userId: 0,
        name: 'Jess Tran',
        email: 'jess@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    };
    const result2 = {
      user: {
        userId: 1,
        name: 'Angel Tran',
        email: 'angel@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    };
    expect(adminUserDetails(NewUser.authUserId)).toStrictEqual(result);
    expect(adminUserDetails(NewUser2.authUserId)).toStrictEqual(result2);
  });
  
  test("Testing successful login attempt update", () => {
    const NewUser = adminAuthRegister("jess@gmail.com", "1234PassWord", "Jess", "Tran");
    adminAuthLogin("jess@gmail.com", "1234PassWord");
    const result = {
        user: {
          userId: 0,
          name: 'Jess Tran',
          email: 'jess@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        },
      };
      expect(adminUserDetails(NewUser.authUserId)).toStrictEqual(result);
  });
    
  test("Testing unsuccessful login attempt update", () => {
    const NewUser = adminAuthRegister("jess@gmail.com", "1234PassWord", "Jess", "Tran");
    adminAuthLogin("jess@gmail.com", " ");
    const result = {
      user: {
        userId: 0,
        name: 'Jess Tran',
        email: 'jess@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 1,
      },
    };
    expect(adminUserDetails(NewUser.authUserId)).toStrictEqual(result);
  });
  
  test("Testing unsuccessful login attempt update after logging in successfully", () => {
    const NewUser = adminAuthRegister("jess@gmail.com", "1234PassWord", "Jess", "Tran");
      adminAuthLogin("jess@gmail.com", " ");
      adminAuthLogin("jess@gmail.com", "1234PassWord");
      const result = {
        user: {
          userId: 0,
          name: 'Jess Tran',
          email: 'jess@gmail.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        },
      };
    expect(adminUserDetails(NewUser.authUserId)).toStrictEqual(result);
  });
  
  test("Test Invalid Auth User ID", () => {
    const user = adminUserDetails("-234");
    expect(user).toStrictEqual({ error: expect.any(String) });
  });
  
});

