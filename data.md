```javascript
let data = {
  users: [
    {
      authUserId: 1,
      nameFirst: "Saarthak",
      nameLast: "Sinha",
      email: "saarthak@gmail.com",
      password: "Password123456",
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 0,
      quizId: [1],
    },
    {
      authUserId: 2,
      nameFirst: "Belinda",
      nameLast: "Wong",
      email: "belinda@gmail.com",
      password: "TestPass1234",
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 3,
      quizId: [1, 2],
    },
    {
      authUserId: 3,
      nameFirst: "Jessica",
      nameLast: "Tran",
      email: "jessica@gmail.com",
      password: "CheckNow1234",
      numSuccessfulLogins: 4,
      numFailedPasswordsSinceLastLogin: 2,
      quizId: [],
    },
  ],
  quizzes: [
    {
      quizId: 1,
      name: "quiz1",
      description:
        "A quiz about the extra curricular activities available at UNSW",
      timeCreated: 1655577887,
      timeLastEdited: 1884723824,
      userId: [1, 2],
    },
    {
      quizId: 2,
      name: "quiz2",
      description: "A quiz about the food and drink options available at UNSW",
      timeCreated: 1655577887,
      timeLastEdited: 1884723824,
      userId: [2],
    },
  ],
};


[Optional] short description: 
