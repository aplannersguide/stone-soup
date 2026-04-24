import Filter from 'bad-words';

const filter = new Filter();

// You can add custom words here if needed in the future
// filter.addWords('specificword');

/**
 * Checks if a string contains profanity
 * @param {string} text - The text to check
 * @returns {boolean} - True if the text is clean, false if it contains profanity
 */
export function isClean(text) {
  if (!text || typeof text !== 'string') return true;
  return !filter.isProfane(text);
}

/**
 * Checks an array of strings or an object's string values for profanity
 * @param {any} input - String, Array of strings, or Object to check
 * @returns {boolean} - True if everything is clean
 */
export function isAllClean(input) {
  if (!input) return true;
  
  if (typeof input === 'string') {
    return isClean(input);
  }
  
  if (Array.isArray(input)) {
    return input.every(item => isClean(item));
  }
  
  if (typeof input === 'object') {
    return Object.values(input).every(val => {
      if (typeof val === 'string') return isClean(val);
      return true;
    });
  }
  
  return true;
}
