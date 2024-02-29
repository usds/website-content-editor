import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  DiffSourceToggleWrapper,
  BlockTypeSelect,
  diffSourcePlugin,
  linkPlugin,
  linkDialogPlugin,
  InsertImage,
  imagePlugin,
  MDXEditorMethods,
  InsertThematicBreak,
  InsertTable, tablePlugin, CreateLink, ListsToggle
} from '@mdxeditor/editor';

import React, {Fragment, useEffect, useRef, useState} from "react";
import {ImageDialogCustom} from "./mdxcomponents/ImageDialogCustom.tsx";
import {frontmatterPlugin} from "./mdxcomponents/frontmatterCustom";
import {InsertFrontmatterCustom} from "./mdxcomponents/frontmatterCustom/InsertFrontmatterCustom.tsx";
import {MainActionsToolbar} from "./components/MainActionsToolbar.tsx";
import {
  CACHE_NAME,
  MARKDOWN_LOCAL_STORAGE_KEY,
  toMarkdownOptions,
} from "./types/commontypes.ts";
import {ToastContainer} from "react-toastify";

import '@mdxeditor/editor/style.css';
import './styles/usdswebsite.override.css';
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import {Button} from "@trussworks/react-uswds";
import {getDefaultMarkdown} from "./mdxcomponents/frontmatterUtils.ts";
import {devResetEverything} from "./misc.ts";

// we use the uswds styles from usds.github.io/website-staging
// import '@uswds/uswds/css/uswds.css';

function App() {
  const [oldMarkdown, setOldMarkdown] = useState<string>("");
  const mdxeditorref = useRef<MDXEditorMethods>(null);
  useEffect(() => {
    (function () {
      try {
        const localMd = localStorage.getItem(MARKDOWN_LOCAL_STORAGE_KEY);
        const saved = localMd ?? getDefaultMarkdown();
        mdxeditorref.current?.setMarkdown(saved);
        setOldMarkdown(saved);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [mdxeditorref, setOldMarkdown]);

  const saveMdText = (mdtext: string) => {
    localStorage.setItem(MARKDOWN_LOCAL_STORAGE_KEY, mdtext);
  }

  // stash upload into the browser cache. We use a service worker to
  // serve back out.
  const imageUploadHandler = async (imageFile: File) => {
    try {
      const webcache = await caches.open(CACHE_NAME);
      // const url = `${image.name}`;
      const buffer = await imageFile.arrayBuffer();
      const response = new Response(buffer, {
        headers: {
          "Content-Type": imageFile.type,
          "Content-Length": String(imageFile.size)
        },
        status: 200,
        statusText: "ok",
      });

      // if the checkbox in the ui is ticked, generate a short filename.
      // await newUrlFromFile(imageFile);
      const newUrl = `${imageFile.name}`;
      await webcache.put(newUrl, response);
      return newUrl;
    } catch (err) {
      console.error(err);
      return "";
    }
  };

  return (
    <Fragment>
      <MainActionsToolbar mdxeditorref={mdxeditorref}/>
      <main id="main-content" role="main">
        <div className="grid-container">
          <div className="grid-row tablet:flex-row-reverse">
            <div
              className="tablet:grid-col-8 desktop:grid-col-12 margin-bottom-9 tablet:padding-right-4 site-c-project-content usa-prose">
              <MDXEditor
                ref={mdxeditorref}
                className={"grid-container"}
                contentEditableClassName={"tablet:grid-col-8 desktop:grid-col-12 margin-bottom-9 tablet:padding-right-4 site-c-project-content usa-prose"}
                suppressHtmlProcessing={false}
                markdown={""}
                onChange={(mdtext) => saveMdText(mdtext)}
                toMarkdownOptions={toMarkdownOptions}
                plugins={[
                  toolbarPlugin({
                    toolbarContents: () => (
                      <Fragment>
                        {' '}
                        <InsertFrontmatterCustom/>
                        {' '}
                        <DiffSourceToggleWrapper>
                          <BlockTypeSelect/>
                          <BoldItalicUnderlineToggles/>
                          <CreateLink/>
                          <ListsToggle/>
                          <InsertThematicBreak/>
                          {' '}
                          <InsertImage/>
                          {' '}
                          <InsertTable/>
                        </DiffSourceToggleWrapper>
                      </Fragment>
                    )
                  }),
                  diffSourcePlugin({diffMarkdown: oldMarkdown, viewMode: 'rich-text'}),
                  frontmatterPlugin(),
                  headingsPlugin({allowedHeadingLevels: [2, 3, 4]}),
                  imagePlugin({imageUploadHandler, disableImageResize: false, ImageDialog: ImageDialogCustom}),
                  linkDialogPlugin(),
                  linkPlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  tablePlugin(),
                  thematicBreakPlugin()
                ]}/>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer limit={4}/>
      <div className={"developer_div"}>
        <Button
          type={"button"}
          accentStyle={"warm"}
          outline={true}
          unstyled={true}
          onClick={()=> {
            if (confirm("Clear all settings and data? This will lose everything and start fresh.\n\nContinue?")) {
              void devResetEverything(mdxeditorref)
            }
          }}>Reset</Button></div>
    </Fragment>
  )
}

export default App
