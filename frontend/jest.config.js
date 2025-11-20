// jest.config.js

module.exports = {
  // Use ts-jest to transform TypeScript files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // Module file extensions to look for
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Setup file for global configs like @testing-library/jest-dom
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'], 
  
  // Jest environment for DOM testing
  testEnvironment: 'jsdom',
  
  // Mapping for module resolution (if you use aliases like @/app)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Mock CSS/Image files to prevent the 'Unexpected token' error on imports
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/__mocks__/fileMock.js',
  },
};