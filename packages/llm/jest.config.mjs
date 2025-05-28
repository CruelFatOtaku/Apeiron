export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "mjs", "json", "node"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
        // 添加以下配置解决常见问题
        isolatedModules: true, // 避免类型检查问题
        tsconfig: "tsconfig.json", // 明确指定tsconfig路径
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    // 如果有路径别名，需要添加如下映射
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // 添加这些关键配置
  transformIgnorePatterns: [
    "node_modules/(?!.*\\.mjs$|module-to-transform)", // 排除node_modules但允许.mjs和特定模块
  ],
  // 对于ESM环境需要这个配置
  globals: {
    "ts-jest": {
      diagnostics: {
        ignoreCodes: ["TS151001"], // 忽略特定TypeScript错误
      },
    },
  },
};
