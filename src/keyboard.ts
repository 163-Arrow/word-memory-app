export type DictationKeyAction = 'replay' | 'submit' | 'next' | 'none';
/** Maps a single input key event to exactly one dictation action. */
export function dictationKeyAction(key: string, code: string, feedback: 'ok' | 'bad' | null): DictationKeyAction {
  if (key === ' ' || code === 'Space') return 'replay';
  if (key !== 'Enter') return 'none';
  if (feedback === 'bad') return 'next';
  return feedback ? 'none' : 'submit';
}
