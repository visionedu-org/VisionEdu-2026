/** @type {import('lighthouse-ci').LHCI.ServerCommand.Options} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready|started server on",
      startServerReadyTimeout: 120000,
      url: ["http://localhost:3000/student/dashboard"],
      numberOfRuns: 3,
      puppeteerScript: "./scripts/lhci-login.mjs",
      settings: {
        preset: "mobile",
        onlyCategories: ["performance"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".planning/phases/07-gamifica-o-e-polimento/lhci",
    },
  },
};
