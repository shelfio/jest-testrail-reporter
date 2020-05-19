# jest-testrail-reporter [![CircleCI](https://circleci.com/gh/shelfio/jest-testrail-reporter/tree/master.svg?style=svg)](https://circleci.com/gh/shelfio/jest-testrail-reporter/tree/master)![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)

> Simple package to submit jest test results to TestRail

## Install

```
$ yarn add --dev @shelf/jest-testrail-reporter
```

## Usage

Step 1. In your `package.json`

```json
{
  "jest": {
    "reporters": ["default", "@shelf/jest-testrail-reporter"]
  }
}
```

Step 2. Add Test Case IDs to your tests in the following format: `#C123`

```ts
it('#C123 should do smth', () => {
  expect(true).toBe(true);
});
```

Step 3. Ensure you have environment variables with credentials setup:

- `process.env.TESTRAIL_HOST`
- `process.env.TESTRAIL_EMAIL`
- `process.env.TESTRAIL_PASSWORD`
- `process.env.TESTRAIL_PROJECT_ID`

## Publish

```sh
$ git checkout master
$ yarn version
$ yarn publish
$ git push origin master --tags
```

## License

MIT © [Shelf](https://shelf.io)
