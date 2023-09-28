function adminQuizInfo(authUserId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    };
}

export { adminQuizInfo }

function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2
    };
}

export { adminQuizCreate }

function adminQuizNameUpdate(authUserId, quizId, name) {
    return {};
}

export { adminQuizNameUpdate }

function adminQuizList(authUserId) {
    return {
        quizzes: [
            {
                quizId: 1,
                name: 'My Quiz',
            }
        ]
    };
}

export { adminQuizList }


function adminQuizRemove(authUserId, quizId) {
    return {};
}

export { adminQuizRemove }

function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    return {};

}

export { adminQuizDescriptionUpdate }

