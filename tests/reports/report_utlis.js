const reporter = require('cucumber-html-reporter');

const options = {
  theme: 'bootstrap',
  brandTitle: 'CBAAS Config Service Component Tests',
  jsonFile: './tests/reports/generated_reports/component-tests-report.json',
  output: './tests/reports/generated_reports/integration_tests_report.html',
  reportSuiteAsScenarios: true,
  launchReport: true,
  metadata: {
    'Release Version': '2.3',
    'Test Environment': 'Integration',
    Browser: '',
    Platform: '',
    Parallel: 'Scenarios',
    Executed: 'Remote',
  },
};

Promise.resolve().then(() => {
  reporter.generate(options);
  process.exit(0);
});
