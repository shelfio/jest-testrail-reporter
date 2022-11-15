import TestRail from 'testrail-api';
import type {AggregatedResult, Context, Reporter} from '@jest/reporters';
import debugLib from 'debug';
import {getCaseIdFromTestTitle, getTestRunsResults} from './helpers';

const debug = debugLib('jest-testrail-reporter');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default class TestRailReporter implements Reporter {
  async onRunComplete(contexts: Set<Context>, results: AggregatedResult): Promise<void> {
    const testrail = new TestRail({
      host: process.env.TESTRAIL_HOST,
      user: process.env.TESTRAIL_EMAIL,
      password: process.env.TESTRAIL_PASSWORD,
    });
    console.log('Edit me please');
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
      .filter(testResult => !testResult.skipped)
      .map(testResult => testResult.testResults)
      .flat()
      .filter(test => test.title.startsWith('C'));
    debug('onRunComplete testRuns', testRuns);

    const allCaseIds = testRuns.map(({title}) => getCaseIdFromTestTitle(title));
    debug('onRunComplete allCaseIds', allCaseIds);

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const {body: run} = await testrail.addRun(Number(process.env.TESTRAIL_PROJECT_ID), {
        case_ids: allCaseIds,
        include_all: false,
        name: '',
      });
      const runId = run.id;
      debug('TestRail: Created Run', run);

      const {body: resp} = await testrail.addResultsForCases(runId, getTestRunsResults(testRuns));
      debug('TestRail: Added Results for Cases', resp);

      const {body: respCloseRun} = await testrail.closeRun(runId);
      debug('TestRail: Closed Run', respCloseRun);
    } catch (error) {
      console.error(error);
    }
  }
}
