import { DataStore } from './dataStore';
import {
  retrieveDataFromFile,
  saveDataInFile,
  isTokenValid,
  getAuthUserIdUsingToken,
} from './functions';

import { adminAuthRegister } from './auth';
import { adminQuizCreate } from './quiz';
import { ErrorObjectWithCode } from './quiz';

const MIN_QUESTION_LENGTH = 5;
const MAX_QUESTION_LENGTH = 50;
const MIN_ANSWERS_LENGTH = 2;
const MAX_ANSWERS_LENGTH = 6;

interface Question {
question: string;
duration: number;
points: number;
answers:
  {
   answer: string;
    correct: boolean;
  }[];
};


export interface QuestionId {
  questionId: number;
}
  

export function createQuizQuestion(token: string, question: Question, quizId: number): 
QuestionId |ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();
  
  //return errors
  //Question string is <5 or > 50 error 400
  if (question.question.length < MIN_QUESTION_LENGTH || question.question.length > MAX_QUESTION_LENGTH) {
    return { error: 'Question length must be between 5 and 50', errorCode: 400};
  }
  
  //The question has more than 6 answers or less than 2 answers error 400
  if (question.answers.length < MIN_ANSWERS_LENGTH || question.answers.length > MAX_ANSWERS_LENGTH) {
    return { error: 'Answers must be between 2 and 6', errorCode: 400};
  }
  
  //The question duration is not a positive number - error 400
  if (question.duration < 0) {
    return { error: 'Question duration must be a positive number', errorCode: 400};
  }
  
  // The sum of the question durations in the quiz exceeds 3 minutes - 400
  
  // The points awarded for the question are less than 1 or greater than 10 - 400
  
  // The length of any answer is shorter than 1 character long, or longer than 30 characters long 
  
  // Any answer strings are duplicates of one another (within the same question) - 400
  
  // There are no correct answers - 400
  const correctAnswer = question.answers.find(a => a.correct === true);
  if (!correctAnswer) {
    return { error: 'There must be at least one correct answer', errorCode: 400};
  }
  
  //invalid token is error 401
  if (!token) {
    return { error: 'Token is empty or invalid', errorCode: 401};
  }

  console.log(data.quizzes);
  //gets authUserId number from token
  const authUserIdString = getAuthUserIdUsingToken(data, token);
  const authUserId = authUserIdString.authUserId;

  //find quiz by quizId number
  console.log('data quizzes length is:', data.quizzes.length);
  const quiz = data.quizzes.find((q) => q.quizId === quizId);
  console.log('Found quiz:', quiz);
  if (quiz) {
    //checks if this uer owns this quiz
    if (quiz.userId.includes(authUserId)) {
      //create new question
      const newQuestion: Question = {
        question: question.question,
        duration: question.duration,
        points: question.points,
        answers: question.answers,
      };
      //adds question to questions
      quiz.questions.push(newQuestion);
      saveDataInFile(data);
      return { questionId: quiz.questions.length };
    } else {
      //valid token but quiz does not belong to this user - error 403
      return { error: "User does not own this quiz", errorCode: 403};
    }  
  } else {
    return { error: "QuizId not found", errorCode: 400 };
  }
}



//debugging code 
const admin = adminAuthRegister('jesssssaas@hotmail.com', '123456abcdefg', 'Jess', 'Tran');
if ('token' in admin) {
  const newQuiz= adminQuizCreate(admin.token, 'First quiz', 'This is my first quiz');  
  const newQuiz2= adminQuizCreate(admin.token, 'Second quiz', 'This is my first quiz'); 
  if ('quizId' in newQuiz) {
    const validQuestion = {
				question: 'What color is the sky?',
				duration: 2,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			};
		
    const validQuestion2 = {
			
				question: 'HELLO ?',
				duration: 2,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			};
   console.log(createQuizQuestion(admin.token, validQuestion, newQuiz.quizId));
  }
}

