
import {Alert} from "@trussworks/react-uswds";
import {ResetButton} from "../components/ResetButton.tsx";
import {ErrorElement} from "../components/ErrorElement.tsx";
import {ErrorBoundary} from "react-error-boundary";

export const HomePage = () => {
  return (<ErrorBoundary fallback={<div><ErrorElement/></div>}>
      <Alert type={"info"} headingLevel={"h2"}>
        This site is static-only and <strong>all data</strong> is saved into your local browser.
      </Alert>
      <h2 id="section-heading-1">Website Content Editor</h2>
      <p>
        Build website posts with fewer mistakes. The intuitive rich text editor lets you see
        how your page will look as you create it. Your work is saved into the browser’s cache and
        you can download a zip file containing your edits and all associated images allow you
        to submit them into Github using Github Desktop.
      </p>

      <p><strong>Click <i>Blog Edit</i> in the top nav to begin.</strong></p>
      <h2 id="section-heading-2">Basic features</h2>

      <img src={"./img/tutorial-1.png"} alt={"screenshot of rich editor toolbar"} className={"zoom-066"}/>
      <p>
        Besides the typical rich text editor buttons, there are some specialized buttons that are
        the most handy.
      </p>
      <ul>
        <li>Crabby will display the page meta information (technically the “Frontmatter yaml header”)
          as guided input form to help you avoid common mistakes.
        </li>
        <li>Inserting images will display them in the page and they will appear in the correct locations
          when you Download the results.
        </li>
        <li>The buttons on the right toggle between Markdown and Rich Text views.</li>
      </ul>

      <p>
        Once you are satisfied with your edits, download the markdown and all related images.
        They are saved locally as a zip file. The file and folder names are all correctly reflected in the markdown.
      </p>

      <p>
        All you have to do is move (aka drag and drop) the files/folders into thee correct location in the Finder.
        The edits will show up in Github Desktop ready to be git committed into a branch.<br/><br/>
        [Graphic/video showing drag-and-drop in Finder then Github Desktop Commit]
      </p>
      <h2 id="section-heading-3">Tips and tricks</h2>
      <ul>
        <li>For best results, correctly size images before uploading. This allows the page template to control the
          size.
        </li>
        <li>Keep the image file sizes small for faster rendering. Use `.jpg` with high quality is recommended.</li>
        <li>Paste in rich text directly into the editor and let it reformat it as markdown. It can include images.</li>
        <li>Shift+paste will insert text without formatting.</li>
        <li>Open an existing post’s markdown file to edit it.</li>
      </ul>
      <ResetButton />
    </ErrorBoundary>
  );
}
