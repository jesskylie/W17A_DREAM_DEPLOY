export function adminQuizInfo(authUserId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    };
}

export function adminQuizCreate (authUserId, name, description) {
    return {
        quizId: 2
    };
}

export function adminQuizNameUpdate (authUserId, quizId, name) {
    return {};
}

export function adminQuizList (authUserId) {
    return { 
        quizzes: [
            {
                quizId: 1,
                name: 'My Quiz',
            }
        ] 
    };
}


export function adminQuizRemove(authUserId, quizId) {
    return { };
}

export function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    return { };

}

