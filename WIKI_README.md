# UNSW COMP1531 23T3

## Dream Team

### Iteration_3 planning meeting 8 November 2023 1300 - 1700 Week 9

### Main Library Level 3 Lab2

### Minutes

### Attendees

• Belinda  
• Paul  
• Jess

• Gul - apologies

### Iteration 3 (New) routes

A discussion was had to allocate these routes amongst team membes. The first step was to review the nature of each route and categorize each as either `EASY` or `HARD` depending on its level of complexity. This was deemed appropriate to ensure when these are allocated amongst members they weren't allocated disproportionately. Consideration was also made as to each routes dependencies, and so which routes should be implemented first.

The following table resulted.

| route                                                         | complexity | dependencies                                                 |               notes |
| ------------------------------------------------------------- | ---------- | ------------------------------------------------------------ | ------------------: |
| PUT /v1/admin/quiz/{quizid}/thumbnail                         | EASY       | POST /v1/admin/quiz/{quizid}/session/start                   |                     |
| GET /v1/admin/quiz/{quizid}/sessions                          | EASY       | POST /v1/admin/quiz/{quizid}/session/start                   |                     |
| POST /v1/admin/quiz/{quizid}/session/start                    | EASY       |                                                              |            DO FIRST |
| PUT /v1/admin/quiz/{quizid}/session/{sessionid}               | HARD       | POST /v1/admin/quiz/{quizid}/session/start                   |                     |
| GET /v1/admin/quiz/{quizid}/session/{sessionid}               | EASY       | POST /v1/admin/quiz/{quizid}/session/start                   |                     |
| GET /v1/admin/quiz/{quizid}/session/{sessionid}/results       | HARD       | relies on both session and players - leave until last        |                     |
| GET /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv   | HARD       | relies on both session and players - leave until last        |                     |
| POST /v1/player/join                                          | HARD       | POST /v1/admin/quiz/{quizid}/session/start                   |            DO FIRST |
| GET /v1/player/{playerid}                                     | EASY       | POST /v1/player/join                                         |                     |
| GET /v1/player/{playerid}/question/{questionposition}         | EASY       | POST /v1/player/join                                         |                     |
| PUT /v1/player/{playerid}/question/{questionposition}/answer  | HARD       | POST /v1/player/join                                         | lots of error cases |
| GET /v1/player/{playerid}/question/{questionposition}/results | EASY       | PUT /v1/player/{playerid}/question/{questionposition}/answer | lots of error cases |
| GET /v1/player/{playerid}/results                             | EASY       | PUT /v1/player/{playerid}/question/{questionposition}/answer |                     |
| GET /v1/player/{playerid}/chat                                |            |                                                              |    leave until last |
| POST /v1/player/{playerid}/chat                               |            |                                                              |    leave until last |
