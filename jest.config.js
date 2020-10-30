module.exports = {
    "roots": [
        "<rootDir>/lib"
    ],
    "transform": {
        "^.+\\.ts?$": "ts-jest"
    },
    "collectCoverage": true,
    "collectCoverageFrom": [
        "lib/**/*.ts",
        "!**/*.test.ts"
    ]
};
