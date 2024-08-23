import {Button} from "@trussworks/react-uswds";
import {devResetEverything} from "../misc.ts";
import {MDXEditorMethods} from "@mdxeditor/editor";

export const ResetButton = ({ mdxeditorref }: { mdxeditorref?:  React.RefObject<MDXEditorMethods> }) => {
  // disable for usability study
  return <div className={"developer_div"}>
    <Button
      type={"button"}
      accentStyle={"warm"}
      outline={true}
      unstyled={true}
      onClick={() => {
        if (confirm("Clear all settings and data? This will lose everything and start fresh.\n\nContinue?")) {
          mdxeditorref?.current?.setMarkdown("");
          void devResetEverything()
        }
      }}>Reset</Button></div>
};
