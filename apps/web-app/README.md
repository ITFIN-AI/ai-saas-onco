# Installation
### Pre-conditions
- node 12+

1) To install project dependencies see README in root folder

2) Copy `.env.dist` and create new file `.env.development`. Pass correct values for environment variables.



# Available Scripts

### Pre-conditions

- Build in watch mode shared package: `cd packages/shared && pnpm watch`

In the project directory, you can run:

### `pnpm dev`

Runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.


### `pnpm test`

Launches the test runner in the interactive watch mode.

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.


# Deployment
Deployment is implemented in pipelines.

- When you create new pull request Github Actions automatically create new preview branch and put link for them as pull request comment

- When you merge changes to develop branch Github Actions automatically deploy changes to development environment
