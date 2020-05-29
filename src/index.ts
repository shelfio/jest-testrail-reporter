import TestRail from 'testrail-api';
import type {Reporter} from '@jest/reporters';
import debugLib from 'debug';
import {getCaseIdFromTestTitle, getTestRunsResults} from './helpers';

const debug = debugLib('jest-testrail-reporter');

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export default class TestRailReporter implements Reporter {
  async onRunComplete(contexts, results) {
    const testrail = new TestRail({
      host: process.env.TESTRAIL_HOST,
      user: process.env.TESTRAIL_EMAIL,
      password: process.env.TESTRAIL_PASSWORD
    });

    debug('onRunComplete results.testResults', results.testResults);

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
    debug('onRunComplete testRuns', testRuns);

    const allCaseIds = testRuns.map(({title}) => getCaseIdFromTestTitle(title));
    debug('onRunComplete allCaseIds', allCaseIds);

    try {
      const runId = await addTestRun(allCaseIds);
      debug('onRunComplete runId', runId);

      const {body: resp} = await testrail.addResultsForCases(runId, getTestRunsResults(testRuns));
      debug('TestRail: Added Results for Cases', resp);

      const {body: respCloseRun} = await testrail.closeRun(runId);
      debug('TestRail: Closed Run', respCloseRun);
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
  debug('TestRail: Created Run', run);

  return run.id;
}
