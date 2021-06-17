import {TestResult} from '@jest/types';
import stripAnsi from 'strip-ansi';

const STATUS_IDS = {
  FAIL: 5,
  PASSED: 1,
};

export function getCaseIdFromTestTitle(testTitle: string): number {
  const regexExecResult = /#C(?<caseId>[\d]*)/.exec(testTitle);

  return Number(regexExecResult.groups.caseId);
}

export function getTestRunsResults(
  testRuns: TestResult.AssertionResult[]
): {case_id: number; status_id: number; comment?: string}[] {
  return testRuns.map(test => ({
    case_id: getCaseIdFromTestTitle(test.title),
    status_id: test.status === 'passed' ? STATUS_IDS.PASSED : STATUS_IDS.FAIL,
    comment: test.status === 'failed' ? stripAnsi(test.failureMessages[0]) : '',
  }));
}
