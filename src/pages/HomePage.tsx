import {Fragment} from "react";

export const HomePage = () => {
  return (<Fragment>
      <p className="usa-intro">
        This site is static only and <strong>all data</strong> is saved into your local browser.
      </p>
      <p>
        Build website posts with fewer mistakes. The intuitive rich text editor lets you see exactly
        how your page will look as you create it. Save your work anytime by downloading a zip file
        containing your edits and all associated images.
      </p>

      <p> ➤ <strong>Click <i>Blog Edit</i> in the top nav to begin.</strong></p>
      <h2 id="section-heading-2">Basic features</h2>

      <img src={"./img/tutorial-1.png"} alt={"screenshot of rich editor toolbar"} className={"zoom-066"}/>
      <p>
        Besides the typical rich text editor buttons, there are some specialized buttons that are
        the most handy.
      </p>
      <ul>
        <li>Crabby will display the page meta information (aka "Frontmatter yaml header" in technobabel) as guided form,
          to help
          you avoid common mistakes.
        </li>
        <li>Inserting images will display them in the page and save them when you Download the results.
          For best results, correctly size images outside before uploading and use .jpg for faster rendering.
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
        <li>Paste in rich text directly into the editor and let it reformat it as markdown. It can include images.</li>
        <li>Open an existing post’s markdown file.</li>
        <li>Paste in existing MD into the Markdown editor view including the yaml header.</li>
      </ul>

    </Fragment>
  );
}
