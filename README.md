# StudentApplicationApp

A mobile application prototype built to help students manage job and internship applications with less stress and more structure.

## Overview

StudentApplicationApp was created in response to a common problem: many students find the application process overwhelming, unstructured, and difficult to stay on top of. The app breaks the process into smaller, guided steps so that students can track their progress, improve their application quality, and stay motivated.

This project was developed as an MVP using **React Native** and **Expo**, with AI-supported feedback integrated through **Gemini**.

## Key Features

- **Application tracking** : create, save, and manage multiple applications in one place
- **Guided workflow** : break large applications into smaller, more manageable tasks
- **AI feedback and analysis** : analyse application content and provide improvement suggestions
- **Application strength scoring** : give students a clearer idea of how strong their application is
- **Progress saving** : retain user progress to reduce frustration and prevent data loss
- **Reminder notifications** : help students stay on top of deadlines and unfinished applications

## Problem the Project Solves

Students often experience stress, avoidance, and burnout during the job application process. This app aims to reduce cognitive load by making progress visible, providing structured support, and offering fast feedback while students build their applications.

Project Aim: To reduce low-quality engagement and psychological attrition among undergraduates during the application season, so that application quality improves and leads to better job search outcomes such as interviews and offers.

## Tech Stack

- **React Native**
- **Expo / Expo Go**
- ** TypeScript**
- **Gemini API** for analysis and feedback
- **Expo Notifications** for reminders

## Running the Project

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the Expo development server:

```bash
npx expo start
```

4. Run the project using:
- Expo Go on a mobile device, or
- an Android/iOS emulator

## Notes

- Some AI powered features depend on Gemini API access and may be affected by free-tier request limits.
- This project was developed and tested primarily as a **single-user prototype** rather than a production deployment.

## Testing and Evaluation

The project was tested using a mixture of:

- **Black-box testing** to check whether features worked as expected
- **Stress testing** to examine how the artefact behaved under repeated or abnormal use
- **Sprint reviews with students** to identify real usability and reliability issues during interaction

Testing highlighted strengths in the guided workflow and feedback features, while also identifying limitations around repeated API requests, notification scheduling, and score consistency, which were improved across later sprints.

## Future Improvements

- implement paid Gemini
- deployment outside Expo Go
- multi-user scalability testing
- imlement backend via Convex
- Regression Tests / Unit Tests

## Author

**Alexander Duya**

