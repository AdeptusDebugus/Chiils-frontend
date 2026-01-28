import api from './api';
import { type Word } from './lessonService';

export interface WordSet {
    id: string;
    name: string;
    word_count: number;
}

/**
 * Creates a new Word Set
 */
export async function createWordSet(name: string): Promise<WordSet> {
    const res = await api.post<WordSet>('/words', null, {
        params: { name }
    });
    return res.data;
}

/**
 * Returns all Word Sets for the authenticated user
 */
export async function getWordSets(): Promise<WordSet[]> {
    const res = await api.get<WordSet[]>('/words');
    return res.data || [];
}

/**
 * Deletes a Word Set and its associations
 */
export async function deleteWordSet(id: string): Promise<void> {
    await api.delete(`/words/${id}`);
}

/**
 * Renames an existing Word Set
 */
export async function renameWordSet(id: string, name: string): Promise<WordSet> {
    const res = await api.patch<WordSet>(`/words/${id}/rename`, null, {
        params: { name }
    });
    return res.data;
}

/**
 * Adds words from Word Bank to a Word Set
 */
export async function addWordsToWordSet(id: string, wordIds: string[]): Promise<void> {
    await api.post(`/words/${id}/words`, wordIds);
}

/**
 * Returns all words in a Word Set
 */
export async function getWordSetWords(id: string): Promise<Word[]> {
    const res = await api.get<Word[]>(`/words/${id}/words`);
    return res.data || [];
}

/**
 * Removes a single word from a Word Set
 */
export async function removeWordFromWordSet(id: string, wordId: string): Promise<void> {
    await api.delete(`/words/${id}/words/${wordId}`);
}
/**
 * Returns the total number of Word Sets created by the authenticated user
 */
export async function getWordSetsCount(): Promise<number> {
    const res = await api.get<number>('/words/total');
    return res.data;
}
