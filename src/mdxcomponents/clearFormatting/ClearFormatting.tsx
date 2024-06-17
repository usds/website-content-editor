import React from "react";
import {activeEditor$, ButtonWithTooltip} from "@mdxeditor/editor"
import {useCellValues} from "@mdxeditor/gurx";

// @ts-expect-error `?react` uses svgr syntax sugar that linter doesn't understand
import ClearFormatSVG from "../../img/clear-format-icon.svg?react";
import {
  $getSelection,
  $getTextContent,
  $isRangeSelection,
  $setSelection,
  LexicalEditor,
  KEY_DELETE_COMMAND,
  SELECTION_CHANGE_COMMAND
} from "lexical";
import {moveNativeSelection} from "../frontmatterUtils.ts";

// Reselected cleared text is a hack right now. It reselects one-character-at-a-time
// which gets really slow for large text blocks. Work-around is to limit it.
const MAX_SELECTION_LENGTH = 2000;

/**
 * A toolbar button that allows the user to insert a thematic break (rendered as an HR HTML element).
 * For this button to work, you need to have the `thematicBreakPlugin` plugin enabled.
 * @group Toolbar Components
 */
export const ClearFormatting: React.FC = () => {
  const [activeEditor] = useCellValues(activeEditor$);

  const clearFormatting = (editor: LexicalEditor | null) => {
    editor?.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      const anchor = selection.anchor;
      const focus = selection.focus;

      if (anchor.key === focus.key && anchor.offset === focus.offset) {
        return;
      }

      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();
      const selectedText = $getTextContent();

      if (
        nativeSelection === null ||
        rootElement === null ||
        !rootElement.contains(nativeSelection.anchorNode) ||
        !editor.isEditable()
      ) {
        return;
      }

      // For 95% of the time, `selection.insertRawText` just works.
      // But sometimes it causes the lexiI don't understand the failure scenario
      // Quickfix is deleting, then inserting.
      // Unfortunately the Delete is in the undo buffer. :facepalm:
      editor.dispatchCommand(KEY_DELETE_COMMAND, new KeyboardEvent("keypress"));

      setTimeout(() => {
        editor?.update(() => {
          // this replaces the elements with plaintext correctly
          // things like lists are NOT collapsed into a single line, which is what we want
          selection.insertRawText(selectedText);

          // this will cause a throw if something got broken by the insert
          editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);

          // we need to let the lexical state process those changes before we can do
          // the next step
          setTimeout(() => {
            editor?.update(() => {
              // now we do the selection natively (see lexicals `moveNativeSelection` comments on why this is done)
              editor.focus();
              const newNativeSelection = window.getSelection();
              if (!newNativeSelection) {
                return;
              }
              // because of the "select back one space" approach, limit max size
              const selectionSize = Math.min(selectedText.length, MAX_SELECTION_LENGTH);

              for (let ii = 0; ii < selectionSize; ii++) {
                // this is literally like pressing shift + arrow left repeatedly.
                // Not sure how slow it is for really large text
                moveNativeSelection(newNativeSelection, 'extend', 'backward', 'character');
              }

              // now, the native selection is correct, sync it back to the lexical selection.
              {
                const postNativeSelection = window.getSelection();
                if (!postNativeSelection || postNativeSelection.rangeCount === 0) {
                  return;
                }
                const selection2 = $getSelection();
                // Apply the DOM selection to our Lexical selection.
                if ($isRangeSelection(selection2)) {
                  const range = postNativeSelection.getRangeAt(0);
                  selection2?.applyDOMRange(range);
                  $setSelection(selection2);
                }
              }
            }); // editor.update
          }, 1); // setTimeout
        });// editor.update
      }, 1);// setTimeout

    });
  };

  return (
    <ButtonWithTooltip title="Clear formatting" onClick={() => clearFormatting(activeEditor)}>
      <ClearFormatSVG/>
    </ButtonWithTooltip>
  )
}
