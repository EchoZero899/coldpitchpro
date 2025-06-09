// clean up prompt string
const trimPromptString = (text: string): string => {
  return text
    .trim() // Remove leading/trailing whitespace
    .replace(/\r\n|\r|\n/g, '\\n') // Replace all line breaks with "\n"
    .replace(/\s+/g, ' '); // Collapse all whitespace into single spaces
};

export default trimPromptString;
