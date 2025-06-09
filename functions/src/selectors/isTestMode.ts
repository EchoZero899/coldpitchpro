import { defineBoolean } from 'firebase-functions/params';

const testModeParam = defineBoolean('TEST_MODE', { default: true });

// detect whether the environment is in test mode
// test mode does not send real emails, etc.
export default function isTestMode(): boolean {
  return testModeParam.value();
}
