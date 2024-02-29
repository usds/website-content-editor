# USDS Site Editor

A static-html, front-end React client to edit markdown and have it look visually similar to how it appears on the final
site.

"Serverless" in the sense that it is running locally in browser with no server interaction required.

Results of edits can be saved to the local device as a zip file, including any images used by the markdown.

## What's working:

- Heavily leverages the open source project: [MDXEditor](https://github.com/mdx-editor/editor)
- Customizes the Frontmatter plugin with a dialog for editing our variables.
- Loads stylesheets/fonts/image from USDS's staging site to make it visually consistent with final look-and-feel.
- Stores uploaded photos into cache and uses a service worker layer to display them in the editor
- Downloads zip file of the markdown and images ready to submitted (all without a server)
- Can "upload" some existing markdown to make quick edits.

## What's still to-do:

- Handle different template types
- Create a better Quote component
- Link component showing offsite links correctly
- Help pages for how to merge in markdown edits back into website
- Need to reorganize code. Lots of things should be separated out into components.
