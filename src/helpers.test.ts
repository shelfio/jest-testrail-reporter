import {TestResult} from '@jest/types';
import {getCaseIdFromTestTitle, getTestRunsResults} from './helpers';

describe('getCaseIdFromTestTitle', () => {
  it('should return case id from test title', () => {
    const testTitle = '#C123 Hello world';

    expect(getCaseIdFromTestTitle(testTitle)).toEqual(123);
  });
});

describe('getTestRunsResults', () => {
  it('should return test run results for 1 failed + 1 passed test', () => {
    const testRuns: TestResult.AssertionResult[] = [
      {
        ancestorTitles: ['foo', 'bar'],
        duration: 1032,
        failureMessages: [],
        failureDetails: [],
        fullName: 'foo bar #C123 hello world',
        location: null,
        numPassingAsserts: 0,
        status: 'passed',
        title: '#C123 hello world',
      },

      {
        ancestorTitles: ['foo', 'bar'],
        duration: 442,
        failureMessages: [
          'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoMatchObject\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n' +
            '\n' +
            '\u001b[32m- Expected  - 1\u001b[39m\n' +
            '\u001b[31m+ Received  + 1\u001b[39m\n' +
            '\n' +
            '\u001b[2m  Object {\u001b[22m\n' +
            '\u001b[2m    "error": Object {\u001b[22m\n' +
            `\u001b[2m      "message": "foo bar",\u001b[22m\n` +
            '\u001b[32m-     "status": 404,\u001b[39m\n' +
            '\u001b[31m+     "status": 403,\u001b[39m\n' +
            '\u001b[2m    },\u001b[22m\n' +
            '\u001b[2m  }\u001b[22m\n' +
            '    at Object.<anonymous> (/Users/dummy/code/xxxxx/xxxx/xxxx/yyyyyyy.test.ts:124:19)\n' +
            '    at processTicksAndRejections (internal/process/task_queues.js:97:5)',
        ],
        failureDetails: [],
        fullName: 'foo bar #C123 hello world',
        location: null,
        numPassingAsserts: 0,
        status: 'failed',
        title: '#C123 hello world',
      },
    ];

    expect(getTestRunsResults(testRuns)).toMatchInlineSnapshot(`
      Array [
        Object {
          "case_id": 123,
          "comment": "",
          "status_id": 1,
        },
        Object {
          "case_id": 123,
          "comment": "Error: expect(received).toMatchObject(expected)

      - Expected  - 1
      + Received  + 1

        Object {
          \\"error\\": Object {
            \\"message\\": \\"foo bar\\",
      -     \\"status\\": 404,
      +     \\"status\\": 403,
          },
        }
          at Object.<anonymous> (/Users/dummy/code/xxxxx/xxxx/xxxx/yyyyyyy.test.ts:124:19)
          at processTicksAndRejections (internal/process/task_queues.js:97:5)",
          "status_id": 5,
        },
      ]
    `);
  });
});
