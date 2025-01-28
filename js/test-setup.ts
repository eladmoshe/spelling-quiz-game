// Set up DOM for all tests
document.body.innerHTML = `<div id="app"></div>`;

// Prevent the global instance creation
jest.mock('./spellingGame', () => {
    const actual = jest.requireActual('./spellingGame');
    // Return the class but prevent automatic instance creation
    const { SpellingGame } = actual;
    return { SpellingGame };
});