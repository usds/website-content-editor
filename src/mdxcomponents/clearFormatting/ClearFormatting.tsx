import React from "react";
import {activeEditor$, ButtonWithTooltip} from "@mdxeditor/editor"
import {useCellValues} from "@mdxeditor/gurx";

// @ts-expect-error `?react` uses svgr syntax sugar that linter doesn't understand
import ClearFormatSVG from "../../../public/img/clear-format-icon.svg?react";
import {
  $getSelection,
  $setSelection,
  $isRangeSelection,
  LexicalEditor,
  $getTextContent,
} from "lexical";
import {moveNativeSelection} from "../frontmatterUtils.ts";


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

      {
        const nativeSelection = window.getSelection();
        const rootElement = editor.getRootElement();
        const selectedText = $getTextContent();

        if (
          nativeSelection !== null &&
          rootElement !== null &&
          rootElement.contains(nativeSelection.anchorNode) &&
          editor.isEditable()
        ) {
          // this replaces the elements with plaintext correctly
          // things like lists are NOT collapsed into a single line, which is what we want
          selection.insertRawText(selectedText);

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
              for (const _eachChar of selectedText) {
                // this is literally like pressing shift + arrow left repeatedly.
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
          }, 100); // setTimeout
        }
      }
    });
  };

  return (
    <ButtonWithTooltip title="Clear formatting" onClick={() => clearFormatting(activeEditor)}>
      <ClearFormatSVG/>
    </ButtonWithTooltip>
  )
}
