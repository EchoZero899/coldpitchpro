// Example usage
// interface ExpectedType {
//   isDuplicate: boolean;
// }
// const chatGPTResponse = '```json\n{\n  "isDuplicate": false\n}\n```';
// const result = parseChatgptResponse<ExpectedType>(chatGPTResponse);

function parseChatgptResponse<T extends object | null>(
  response: string
): T | null {
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonString = jsonMatch ? jsonMatch[1].trim() : response; // Trim to clean up whitespace

  try {
    const parsed = JSON.parse(jsonString);

    // Ensure it's an object (basic validation)
    if (typeof parsed !== 'object' || parsed === null) {
      throw Error('Parsed JSON is not an object.');
    }

    // If T is provided, validate structure dynamically
    if (typeof parsed === 'object' && parsed !== null && ({} as T)) {
      return parsed as T;
    }

    return parsed; // Return parsed JSON if no specific type enforcement
  } catch (error: any) {
    throw Error(`Error parsing JSON: ${error}`);
  }
}

export default parseChatgptResponse;
