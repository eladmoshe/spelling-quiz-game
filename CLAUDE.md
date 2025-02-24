# SpellingQuiz Commands and Style Guide

## Commands
- Build: `npm run build` 
- Dev server: `npm run dev` (TypeScript watch + HTTP server)
- Test (all): `npm test`
- Test (single): `npm test -- -t "test name pattern"`
- E2E tests: `npm run test:e2e`
- Start server: `npm start`

## Code Style
- **TypeScript**: Strict mode, explicit types, no implicit any
- **Naming**: camelCase for variables/methods, PascalCase for classes
- **Imports**: ES modules format (import/export)
- **Classes**: Prefer interfaces for type definitions, classes for implementation
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Error Handling**: Explicit error types, prefer early returns
- **Documentation**: JSDoc comments for public methods and interfaces
- **Formatting**: No trailing whitespace, consistent indentation (2 spaces)
- **Functions**: Pure functions where possible, explicit return types