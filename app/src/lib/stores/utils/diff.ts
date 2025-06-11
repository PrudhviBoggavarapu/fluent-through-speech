// src/lib/utils/diff.ts

export interface DiffResult {
    text: string;
    type: 'correct' | 'incorrect' | 'extra';
}

// A basic word-level diff implementation (Longest Common Subsequence based)
export function diffWords(original: string, transcribed: string): DiffResult[] {
    const originalWords = original.trim().split(/\s+/);
    const transcribedWords = transcribed.trim().split(/\s+/);

    const dp = Array(transcribedWords.length + 1)
        .fill(null)
        .map(() => Array(originalWords.length + 1).fill(0));

    for (let i = transcribedWords.length - 1; i >= 0; i--) {
        for (let j = originalWords.length - 1; j >= 0; j--) {
            if (transcribedWords[i].toLowerCase() === originalWords[j].toLowerCase()) {
                dp[i][j] = 1 + dp[i + 1][j + 1];
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    const result: DiffResult[] = [];
    let i = 0,
        j = 0;
    while (i < transcribedWords.length && j < originalWords.length) {
        if (transcribedWords[i].toLowerCase() === originalWords[j].toLowerCase()) {
            result.push({ text: originalWords[j], type: 'correct' });
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            result.push({ text: transcribedWords[i], type: 'extra' });
            i++;
        } else {
            result.push({ text: originalWords[j], type: 'incorrect' });
            j++;
        }
    }

    while (i < transcribedWords.length) {
        result.push({ text: transcribedWords[i], type: 'extra' });
        i++;
    }
    while (j < originalWords.length) {
        result.push({ text: originalWords[j], type: 'incorrect' });
        j++;
    }

    return result;
}