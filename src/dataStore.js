// YOU SHOULD MODIFY THIS OBJECT BELOW
let data = {
  users: [
    {
      userId: 1,
      nameFirst: 'Saarthak',
      nameLast: 'Sinha',
      email: 'saarthak@gmail.com',
      password: "Password123456",
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 0,
      quizid: [1],
    },
    {
      userId: 2,
      nameFirst: 'Belinda',
      nameLast: 'Wong',
      email: 'belinda@gmail.com',
      password: "TestPass1234",
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 3,
      quizid: [1, 2],
    },
    {
      userId: 3,
      nameFirst: 'Jessica',
      nameLast: 'Tran',
      email: 'jessica@gmail.com',
      password: "CheckNow1234",
      numSuccessfulLogins: 4,
      numFailedPasswordsSinceLastLogin: 2,
      quizid: [],
    },
  ],
  quizzes: [
    {
      quizid: 1,
      name: 'quiz1',
      description: "A quiz about the extra curricular activities available at UNSW",
      timeCreated: 1655577887,
      timeLastEdited: 1884723824,
      userId: [1, 2],
    },
    {
      quizid: 2,
      name: 'quiz2',
      description: "A quiz about the food and drink options available at UNSW",
      timeCreated: 1655577887,
      timeLastEdited: 1884723824,
      userId: [2],
    },
  ],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
  data = newData;
}

export { getData, setData };
