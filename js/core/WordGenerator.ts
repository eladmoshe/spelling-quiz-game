import { WordOptions } from '../models/WordModel.js';

export class WordGenerator {
  private readonly wordLists = {
    easy: [
      // 3-4 letters
      'act', 'add', 'age', 'air', 'ant', 'arm', 'art', 'bag', 'bat',
      'bed', 'bee', 'box', 'boy', 'bus', 'cap', 'car', 'cat', 'cow',
      'cry', 'cup', 'cut', 'dad', 'day', 'dog', 'dot', 'dry', 'ear',
      'eat', 'egg', 'end', 'eye', 'fan', 'far', 'fat', 'fit', 'fix',
      'fly', 'fog', 'fun', 'gas', 'get', 'god', 'hat', 'hay', 'hen',
      'hot', 'ice', 'ink', 'jar', 'joy', 'key', 'kid', 'leg', 'let',
      'lid', 'lie', 'lip', 'lot', 'low', 'map', 'mat', 'may', 'mix',
      // 5-6 letters
      'about', 'above', 'after', 'again', 'apple', 'beach', 'bread',
      'brick', 'bring', 'brush', 'candy', 'carry', 'chair', 'chalk',
      'clean', 'clock', 'cloud', 'color', 'dance', 'drink', 'earth',
      'every', 'field', 'first', 'floor', 'flower', 'found', 'fresh',
      'front', 'funny', 'ghost', 'glass', 'grape', 'grass', 'green',
      'happy', 'heart', 'horse', 'house', 'juice', 'laugh', 'learn',
      'light', 'lunch', 'magic', 'money', 'month', 'mouse', 'mouth',
      'music', 'night', 'noise', 'ocean', 'paint', 'paper', 'party',
      'peace', 'phone', 'plant', 'prize', 'quiet', 'radio', 'river',
      'round', 'sheep', 'shoes', 'short', 'sleep', 'small', 'smile',
      'snake', 'space', 'speak', 'spoon', 'spring', 'stamp', 'stand',
      'star', 'start', 'story', 'sweet', 'table', 'thank', 'think',
      'tiger', 'train', 'tree', 'truck', 'under', 'water', 'white',
      'world', 'write', 'young',
      // Additional easy words (3-6 letters)
      'bake', 'ball', 'barn', 'belt', 'book', 'gift', 'girl', 'goat',
      'gold', 'good', 'hill', 'king', 'kite', 'lake', 'leaf', 'meal',
      'milk', 'moon', 'neck', 'nest', 'rock', 'rose', 'salt', 'seed',
      'ship', 'sing', 'song', 'swim', 'tail', 'tall', 'team', 'tent',
      'time', 'toys', 'wall', 'wave', 'wind', 'wolf', 'zoo'
    ],
    medium: [
      // 7-9 letters
      'airplane', 'alphabet', 'baseball', 'bathroom', 'birthday',
      'blanket', 'breakfast', 'building', 'butterfly', 'calendar',
      'camera', 'camping', 'candle', 'captain', 'careful', 'carnival',
      'carpet', 'carrot', 'cartoon', 'castle', 'ceiling', 'center',
      'channel', 'chapter', 'chicken', 'children', 'chimney', 'chocolate',
      'circle', 'climate', 'college', 'comfort', 'company', 'complete',
      'computer', 'concert', 'cookie', 'corner', 'cottage', 'country',
      'crayon', 'creative', 'cricket', 'crystal', 'cucumber', 'curious',
      'cushion', 'dancing', 'daughter', 'diamond', 'dinner', 'direction',
      'dolphin', 'drawing', 'dream', 'elephant', 'envelope', 'evening',
      'example', 'exercise', 'explore', 'family', 'favorite', 'feather',
      'feeling', 'festival', 'finger', 'fireplace', 'fishing', 'flower',
      'football', 'forest', 'forward', 'freedom', 'friendly', 'garden',
      'general', 'giraffe', 'glasses', 'goodbye', 'grateful', 'grocery',
      'guitar', 'hamster', 'handful', 'happy', 'harvest', 'healthy',
      'hearing', 'helpful', 'history', 'holiday', 'honey', 'hospital',
      'hundred', 'hungry', 'hunting', 'imagine', 'improve', 'insect',
      'island', 'jacket', 'jelly', 'journey', 'jungle', 'kangaroo',
      'kitchen', 'kitten', 'language', 'laughter', 'learning', 'library',
      'lightning', 'listen', 'machine', 'magazine', 'magical', 'manager',
      'marble', 'market', 'memory', 'message', 'miracle', 'monkey',
      'morning', 'mountain', 'mystery', 'natural', 'necklace', 'needle',
      // Additional medium words (7-9 letters)
      'avocado', 'backpack', 'batteries', 'business', 'colorful',
      'cupboard', 'notebook', 'shoulder', 'umbrella', 'vertical',
      'scissors', 'tomorrow', 'treasure', 'sandwich', 'siblings',
      'universe'
    ],
    hard: [
      // 10+ letters
      'absolutely', 'acceptable', 'accessible', 'accomplish', 'achievement',
      'activities', 'adventure', 'afternoon', 'agreement', 'amazing',
      'apartment', 'appreciate', 'attention', 'attractive', 'automobile',
      'background', 'basketball', 'beautiful', 'beginning', 'believe',
      'blackberry', 'blueberry', 'butterfly', 'calculator', 'california',
      'carefully', 'celebrate', 'celebration', 'challenge', 'champion',
      'character', 'chocolate', 'christmas', 'classroom', 'collection',
      'comfortable', 'community', 'completely', 'computer', 'concentrate',
      'condition', 'confidence', 'connection', 'consider', 'continue',
      'contribute', 'controller', 'convenient', 'conversation', 'coordinate',
      'correctly', 'dangerous', 'decoration', 'definitely', 'delicious',
      'department', 'describe', 'description', 'determine', 'development',
      'difference', 'difficult', 'direction', 'disappear', 'discover',
      'discussion', 'education', 'electrical', 'elementary', 'elephant',
      'encourage', 'engineering', 'environment', 'equipment', 'especially',
      'everybody', 'everything', 'everywhere', 'excellent', 'excitement',
      'exercise', 'experience', 'experiment', 'explain', 'expression',
      'fantastic', 'favorite', 'friendship', 'furniture', 'generally',
      'generation', 'government', 'grandfather', 'grandmother', 'grasshopper',
      'grateful', 'happiness', 'helicopter', 'helpful', 'hospital',
      'household', 'important', 'impossible', 'improve', 'incredible',
      'independent', 'individual', 'information', 'ingredient', 'inside',
      'instrument', 'intelligent', 'interest', 'interesting', 'international',
      'interview', 'introduce', 'invention', 'invitation', 'keyboard',
      // Additional hard words (10+ letters)
      'responsible', 'communication', 'imagination', 'supermarket',
      'transportation', 'conservation', 'understanding', 'extraordinary',
      'championship', 'strawberries', 'watermelon'
    ]
  };

  /**
   * Generates random words based on the provided options
   * @param options Word generation options (difficulty, count)
   * @returns Promise resolving to an array of randomly selected words
   */
  public async getRandomWords(options: WordOptions): Promise<string[]> {
    try {
      const availableWords = this.wordLists[options.difficulty];
      const shuffled = this.shuffleArray([...availableWords]);
      return shuffled.slice(0, options.count);
    } catch (error) {
      console.error('Error generating random words:', error);
      return [];
    }
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   * @param array The array to shuffle
   * @returns A new shuffled array
   */
  public shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export default WordGenerator;