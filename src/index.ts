import TestRail from 'testrail-api';
import stripAnsi from 'strip-ansi';
import type {Reporter} from '@jest/reporters';
import type {TestResult} from '@jest/types';

const testrail = new TestRail({
  host: process.env.TESTRAIL_HOST,
  user: process.env.TESTRAIL_EMAIL,
  password: process.env.TESTRAIL_PASSWORD
});

const STATUS_IDS = {
  FAIL: 5,
  PASSED: 1
};

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export default class TestRailReporter implements Reporter {
  async onRunComplete(contexts, results) {
    const testRuns = results.testResults
      .filter((testResult) => !testResult.skipped)
      .map((testResult) => testResult.testResults)
      .flat()
      .filter((test) => test.title.startsWith('#C'));
    const allCaseIds = testRuns.map(({title}) => {
      return getCaseIdFromTestTitle(title);
    });

    try {
      const runId = await addTestRun(allCaseIds);

      await testrail.addResultsForCases(runId, getTestRunsResults(testRuns));

      await testrail.closeRun(runId);
    } catch (error) {
      console.error(error);
    }
  }
}

async function addTestRun(caseIds: number[]): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const {body: run} = await testrail.addRun(1, {
    case_ids: caseIds,
    include_all: false
  });

  return run.id;
}

function getTestRunsResults(
  testRuns: TestResult.AssertionResult[]
): {case_id: number; status_id: number; comment?: string}[] {
  return testRuns.map((test) => ({
    case_id: getCaseIdFromTestTitle(test.title),
    status_id: test.status === 'passed' ? STATUS_IDS.PASSED : STATUS_IDS.FAIL,
    comment: test.status === 'failed' ? stripAnsi(test.failureMessages[0]) : ''
  }));
}

function getCaseIdFromTestTitle(testTitle: string): number {
  return Number(/#C(?<caseId>[\d]*)/.exec(testTitle).groups.caseId);
}
