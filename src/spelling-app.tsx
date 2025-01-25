import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Volume2, Smile, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';

interface Word {
  word: string;
  definition?: string;
}

const SpellingApp: React.FC = () => {
  const [wordList, setWordList] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showPractice, setShowPractice] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  // Function to shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStart = () => {
    const words = inputText.split(',').map(word => word.trim()).filter(word => word);
    if (words.length > 0) {
      const randomizedWords = shuffleArray(words);
      setWordList(randomizedWords);
      setCurrentIndex(0);
      setShowPractice(true);
      pronounceWord(randomizedWords[0]);
    }
  };

  // Function to pronounce word very slowly
  const pronounceWord = (word) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.5;  // Much slower
    utterance.pitch = 1;   // Normal pitch
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Function to get next letter hint based on current input
  const getNextLetterHint = () => {
    const currentWord = wordList[currentIndex];
    const correctSoFar = userAnswer.toLowerCase();
    
    // If what's typed so far is correct
    if (currentWord.toLowerCase().startsWith(correctSoFar)) {
      const nextLetterIndex = correctSoFar.length;
      if (nextLetterIndex < currentWord.length) {
        return {
          correct: true,
          message: `Next letter is: "${currentWord[nextLetterIndex]}"`,
          progress: `${correctSoFar}${currentWord[nextLetterIndex]}${'_'.repeat(currentWord.length - nextLetterIndex - 1)}`
        };
      }
    }
    // If there's an error in what's typed
    const firstWrongIndex = [...correctSoFar].findIndex((char, index) => 
      char !== currentWord[index]?.toLowerCase()
    );
    return {
      correct: false,
      message: `Check letter #${firstWrongIndex + 1}. Should be: "${currentWord[firstWrongIndex]}"`,
      progress: `${currentWord.slice(0, firstWrongIndex)}${currentWord[firstWrongIndex]}${'_'.repeat(currentWord.length - firstWrongIndex - 1)}`
    };
  };

  // Function to get word patterns for display after correct answer
  const getWordPatterns = (word) => {
    const patterns = [];
    let processedWord = word.toLowerCase();
    let coloredWord = [];
    let index = 0;

    while (index < word.length) {
      let patternFound = false;
      
      // Check for consonant blends
      const blendMatch = word.slice(index).match(/^(bl|br|ch|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|sh|sk|sl|sm|sn|sp|st|sw|th|tr|tw|wh)/i);
      if (blendMatch) {
        coloredWord.push(
          <span key={index} className="text-blue-600 font-bold">
            {word.slice(index, index + blendMatch[0].length)}
          </span>
        );
        index += blendMatch[0].length;
        patternFound = true;
        continue;
      }

      // Check for vowel pairs
      const vowelMatch = word.slice(index).match(/^[aeiou]{2}/i);
      if (vowelMatch) {
        coloredWord.push(
          <span key={index} className="text-purple-600 font-bold">
            {word.slice(index, index + 2)}
          </span>
        );
        index += 2;
        patternFound = true;
        continue;
      }

      // Check for doubled letters
      if (index < word.length - 1 && word[index].toLowerCase() === word[index + 1].toLowerCase()) {
        coloredWord.push(
          <span key={index} className="text-green-600 font-bold">
            {word.slice(index, index + 2)}
          </span>
        );
        index += 2;
        patternFound = true;
        continue;
      }

      // Individual vowels
      if ('aeiou'.includes(word[index].toLowerCase())) {
        coloredWord.push(
          <span key={index} className="text-red-600">
            {word[index]}
          </span>
        );
      } else {
        // Regular consonants
        coloredWord.push(
          <span key={index} className="text-gray-700">
            {word[index]}
          </span>
        );
      }
      index++;
    }

    return (
      <div className="space-y-2">
        <p className="text-2xl font-mono tracking-wide text-center">
          {coloredWord}
        </p>
        <div className="text-sm space-y-1">
          <p><span className="text-blue-600 font-bold">Blue</span>: Consonant blends (like 'sh', 'th')</p>
          <p><span className="text-purple-600 font-bold">Purple</span>: Vowel pairs</p>
          <p><span className="text-green-600 font-bold">Green</span>: Double letters</p>
          <p><span className="text-red-600">Red</span>: Single vowels</p>
        </div>
      </div>
    );
  };

  const currentWord = wordList[currentIndex];

  const speakWord = () => {
    pronounceWord(currentWord);
  };

  const checkAnswer = () => {
    if (userAnswer.toLowerCase() === currentWord.toLowerCase()) {
      setIsCorrect(true);
      setShowError(false);
      // Spell it out and pronounce it as a reward
      setTimeout(() => {
        pronounceWord(currentWord);
      }, 500);
    } else {
      setShowError(true);
      setIsCorrect(false);
    }
  };

  const nextWord = () => {
    if (currentIndex < wordList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setIsCorrect(false);
      setShowError(false);
      setTimeout(() => {
        pronounceWord(wordList[currentIndex + 1]);
      }, 500);
    } else {
      setShowPractice(false);
      setInputText('');
      setWordList([]);
      setCurrentIndex(0);
      setUserAnswer('');
      setIsCorrect(false);
      setShowError(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isCorrect) {
        nextWord();
      } else {
        checkAnswer();
      }
    }
  };

  if (!showPractice) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Enter Words</h2>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter words separated by commas"
            />
            <Button 
              onClick={handleStart} 
              className="w-full"
              disabled={!inputText.trim()}
            >
              Start Practice
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hint = getNextLetterHint();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Spell the Word</h2>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPractice(false);
                setInputText('');
                setWordList([]);
                setCurrentIndex(0);
                setUserAnswer('');
                setIsCorrect(false);
                setShowError(false);
              }}
            >
              New Words
            </Button>
          </div>
          
          <p className="text-center">Word {currentIndex + 1} of {wordList.length}</p>
          
          <div className="flex gap-2">
            <Button onClick={speakWord} className="flex-1">
              <Volume2 className="mr-2 h-4 w-4" />
              Listen to the word
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowError(prev => !prev)} 
              className="flex items-center gap-2"
              disabled={!userAnswer}
            >
              <HelpCircle className="h-4 w-4" />
              Hint
            </Button>
          </div>

          {showError && (
            <div className="bg-yellow-50 p-3 rounded-md">
              <p className="text-center font-medium mb-2">{hint.message}</p>
              <p className="font-mono text-center text-lg">{hint.progress}</p>
            </div>
          )}

          <Input
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              setShowError(false);
              setIsCorrect(false);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer"
            autoFocus
            className={`text-lg text-center ${
              isCorrect ? 'bg-green-50 border-green-500' : 
              showError ? 'bg-red-50 border-red-500' : ''
            }`}
          />

          {!isCorrect && (
            <Button onClick={checkAnswer} className="w-full">
              Check Answer
            </Button>
          )}

          {isCorrect && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <Sparkles className="w-6 h-6" />
                <span className="text-lg font-medium">Excellent job!</span>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Let's break down this word to help you remember it:
                </p>
                {getWordPatterns(currentWord)}
              </div>
              
              {currentIndex < wordList.length - 1 ? (
                <Button
                  onClick={nextWord}
                  className="w-full flex items-center justify-center gap-2"
                >
                  Next Word
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-medium text-green-500 mb-4">
                    Congratulations! You've completed all words! 🎉
                  </p>
                  <Button onClick={() => {
                    setShowPractice(false);
                    setInputText('');
                    setWordList([]);
                    setCurrentIndex(0);
                    setUserAnswer('');
                    setIsCorrect(false);
                    setShowError(false);
                  }}>
                    Practice New Words
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellingApp;