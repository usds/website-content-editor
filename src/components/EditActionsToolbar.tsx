import {ButtonGroup, Button} from "@trussworks/react-uswds";
import {MDXEditorMethods} from "@mdxeditor/editor";

import {
  getBlogTemplateMarkdown,
  saveDataToZip,
} from "../mdxcomponents/frontmatterUtils.ts";
import {showToast} from "./showToast.tsx";
import {MARKDOWN_LOCAL_STORAGE_KEY} from "../types/commontypes.ts";
import { Fragment, useRef} from "react";

export const EditActionsToolbar = (props: {
  mdxeditorref: React.RefObject<MDXEditorMethods>,
}) => {
  const newFromTemplate = () => {
    if (!confirm("This will replace any work you may have unsaved.\n\nContinue?")) {
      return;
    }
    const mdtext = getBlogTemplateMarkdown();
    props.mdxeditorref?.current?.setMarkdown(mdtext);
    localStorage.setItem(MARKDOWN_LOCAL_STORAGE_KEY, mdtext);
  }

  const loadData = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (!evt.target?.files?.length) {
      return;
    }
    const file = evt.target.files[0];
    const mdtext = await file.text();
    // there some cleanup. `<usds@omb.eop.gov>` can cause the md to fail. there are probably other exceptions
    // so this should be made generic. Seems like some micromark-extension should handle it correctly?
    // If nothing else, it should be turned into a grep
    const cleanmdtext = mdtext.replace(`<usds@omb.eop.gov>`, 'usds@omb.eop.gov');
    props.mdxeditorref?.current?.setMarkdown(cleanmdtext);
    localStorage.setItem(MARKDOWN_LOCAL_STORAGE_KEY, mdtext);
    // setTimeout(() => {
    //   window.location.reload(); // needs some help loading cached images
    // }, 250);
    // todo: go through images and see what's missing from cache and prompt for files
  }

  const saveData = async () => {
    try {
      // grab the markdown
      const markdownstr = props.mdxeditorref?.current?.getMarkdown();
      if (!markdownstr) {
        showToast("Didn't find any markdown. Emtpy?", "error");
        return;
      }

      await saveDataToZip(markdownstr);
    } catch (err) {
      console.error(err);
    }
  }
  const fileButtonRef = useRef<HTMLInputElement>(null);
  return (
    <Fragment>
      <ButtonGroup className={"margin-2em"}>
        <Button type={"button"} onClick={() => newFromTemplate()}>New from Blog Template</Button>
        <Button type={"button"} onClick={() => {
          if (!confirm("Loading new a new Markdown file will replace any edits you may have pending.\n\nContinue?")) {
            return;
          }
          fileButtonRef.current?.click();
        }}>Load from file...</Button>
        <input ref={fileButtonRef}
               type="file"
               id={"uploadMarkdownButtonHidden"}
               accept={"text/markdown"}
               onChange={(evt) => void loadData(evt)}/>
        <Button type={"button"} outline onClick={() => {
          void (async () => {
            await saveData();
          })();
        }}>Download (Save)</Button>
      </ButtonGroup>
    </Fragment>
  );
}
