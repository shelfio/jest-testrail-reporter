import TestRail from 'testrail-api';
import type {Reporter} from '@jest/reporters';
import {getCaseIdFromTestTitle, getTestRunsResults} from './helpers';

const testrail = new TestRail({
  host: process.env.TESTRAIL_HOST,
  user: process.env.TESTRAIL_EMAIL,
  password: process.env.TESTRAIL_PASSWORD
});

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export default class TestRailReporter implements Reporter {
  async onRunComplete(contexts, results) {
    if (
      !process.env.TESTRAIL_HOST ||
      !process.env.TESTRAIL_EMAIL ||
      !process.env.TESTRAIL_PASSWORD
    ) {
      console.log('TestRail Reporter: Skipping since no credentials setup');

      return;
    }

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

      const {body: resp} = await testrail.addResultsForCases(runId, getTestRunsResults(testRuns));
      console.log('TestRail: Added Results for Cases', resp);

      const {body: respCloseRun} = await testrail.closeRun(runId);
      console.log('TestRail: Closed Run', respCloseRun);
    } catch (error) {
      console.error(error);
    }
  }
}

async function addTestRun(caseIds: number[]): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const {body: run} = await testrail.addRun(Number(process.env.TESTRAIL_PROJECT_ID), {
    case_ids: caseIds,
    include_all: false,
    name: ''
  });
  console.log('TestRail: Created Run', run);

  return run.id;
}
