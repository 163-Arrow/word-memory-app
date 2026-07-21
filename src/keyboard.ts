export type DictationKeyboardActions = {
  canSubmit: boolean;
  canContinue: boolean;
  replay: () => void;
  submit: () => void;
  continue: () => void;
};

/** Handles one dictation key press from the single page-level listener. */
export function handleDictationKeydown(event: KeyboardEvent, actions: DictationKeyboardActions) {
  if (event.code === 'Space') {
    event.preventDefault();
    actions.replay();
    return;
  }
  if (event.key !== 'Enter') return;

  event.preventDefault();
  if (actions.canContinue) actions.continue();
  else if (actions.canSubmit) actions.submit();
}
