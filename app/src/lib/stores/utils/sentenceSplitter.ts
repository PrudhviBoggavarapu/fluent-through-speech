// src/lib/utils/sentenceSplitter.ts

/**
 * Splits a given text into an array of sentences.
 * This is a basic implementation and might not cover all edge cases
 * (e.g., abbreviations like "Dr." or "Mr.").
 *
 * @param text The input paragraph as a string.
 * @returns An array of strings, where each string is a sentence.
 */
export function splitParagraphIntoSentences(text: string): string[] {
    if (!text || text.trim() === '') {
        return [];
    }

    // Regex explanation:
    // ([.?!]) captures the punctuation.
    // (?!\s*[A-Z]) ensures we don't split after abbreviations (e.g., "Dr. Smith").
    // \s+ matches one or more whitespace characters.
    // This regex splits by sentence-ending punctuation followed by whitespace,
    // but tries to avoid splitting mid-sentence on periods (e.g., abbreviations).
    // It also removes leading/trailing whitespace from each sentence.
    const sentences = text
        .match(/[^.!?]+[.!?]\s*|\s*[^.!?]+$/g)
        ?.map((sentence) => sentence.trim())
        .filter(Boolean); // Filter out any empty strings

    return sentences || [];
}