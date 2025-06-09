# ColdPitchPro

Serverless firebase functions for Cold Pitch Pro. TypeScript + NodeJS with Firebase Functions, Firestore, Postmark, Gumroad, and ChatGPT integrations.

## Directory Layout

- `src/functions`: core logic and firebase functions
- `src/helpers`: re-usable, specific code snippets to perform common tasks between functions
- `src/integrations`: 3rd party api wrappers and abstracted methods
- `src/utils`: re-usable abstract code snippets

## First-time setup

### 1. Install firebase CLI

The firebase CLI is needed to run the emulators for local development and testing.

https://firebase.google.com/docs/cli

Follow the installation instructions, including the "log in and test the firebase CLI" step.

### 2. Install dependencies

```
$ cd functions
$ npm ci
```

## Configure env secrets

Copy-paste the `.env.example` file and name the copied file `.env.local`.

Update secret values with corresponding secrets from 1Password.

## Run locally

From the functions folder:

```
$ npm run serve
```

This will launch the local firebase emulators for testing.

## Manual deployment (non-CI/CD)

Manual deployment instructions:

1. Prep env secrets in `.env.default` file
2. Run these commands:

```
$ firebase use default
$ npm run deploy
```
