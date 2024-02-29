import {
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  addMdastExtension$,
  addSyntaxExtension$,
  addToMarkdownExtension$,
  createRootEditorSubscription$,
  realmPlugin,
  rootEditor$
} from "@mdxeditor/editor";
import {Action, Cell, withLatestFrom} from '@mdxeditor/gurx'
import {$getRoot} from 'lexical'
import {frontmatterFromMarkdown, frontmatterToMarkdown} from 'mdast-util-frontmatter'
import {frontmatter} from 'micromark-extension-frontmatter'
import {$createFrontmatterCustomNode, $isFrontmatterCustomNode, FrontmatterCustomNode} from './FrontmatterCustomNode.tsx'
import {LexicalFrontmatterCustomVisitor} from './LexicalFrontmatterCustomVisitor.ts'
import {MdastFrontmatterCustomVisitor} from './MdastFrontmatterCustomVisitor.ts'

type YamlTypes = "blog" | "";

type FrontmatterCustomYamlParams = {
  yamlType?: YamlTypes;
 // yamlDefaultTemplate?: string;
}
/**
 * Whether the frontmatter dialog is open.
 * @group Frontmatter
 */
export const frontmatterCustomDialogOpen$ = Cell(false);

export const frontmatterYamlType$ = Cell<FrontmatterCustomYamlParams>({
  yamlType: "blog",
});

/**
 * Inserts a frontmatter node at the beginning of the markdown document.
 * @group Frontmatter
 */
export const insertFrontmatterCustom$ = Action((r) => {
  r.sub(r.pipe(insertFrontmatterCustom$, withLatestFrom(rootEditor$)), ([, rootEditor]) => {
    rootEditor?.update(() => {
      const firstItem = $getRoot().getFirstChild()
      if (!$isFrontmatterCustomNode(firstItem)) {
        const fmNode = $createFrontmatterCustomNode('"": ""')
        if (firstItem) {
          firstItem.insertBefore(fmNode)
        } else {
          $getRoot().append(fmNode)
        }
      }
    })
    r.pub(frontmatterCustomDialogOpen$, true);
  })
})

/**
 * Removes the frontmatter node from the markdown document.
 * @group Frontmatter
 */
export const removeFrontmatterCustom$ = Action((r) => {
  r.sub(r.pipe(removeFrontmatterCustom$, withLatestFrom(rootEditor$)), ([, rootEditor]) => {
    rootEditor?.update(() => {
      const firstItem = $getRoot().getFirstChild()
      if ($isFrontmatterCustomNode(firstItem)) {
        firstItem.remove();
      }
    })
    r.pub(frontmatterCustomDialogOpen$, false);
  })
})

/**
 * Whether the markdown document has a frontmatter node.
 * @group FrontmatterCustom
 */
export const hasFrontmatterCustom$ = Cell(false, (r) => {
  r.pub(createRootEditorSubscription$, (rootEditor) => {
    return rootEditor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        r.pub(hasFrontmatterCustom$, $isFrontmatterCustomNode($getRoot().getFirstChild()))
      })
    })
  })
})

/**
 * A plugin that adds support for frontmatter.
 * @group Frontmatter
 */
export const frontmatterPlugin = realmPlugin<FrontmatterCustomYamlParams>({
  init: (realm, params) => {
    realm.pubIn({
      [frontmatterYamlType$]: params?.yamlType ?? "",
      // import
      [addMdastExtension$]: frontmatterFromMarkdown('yaml'),
      [addSyntaxExtension$]: frontmatter(),
      [addImportVisitor$]: MdastFrontmatterCustomVisitor,
      // export
      [addLexicalNode$]: FrontmatterCustomNode,
      [addExportVisitor$]: LexicalFrontmatterCustomVisitor,
      [addToMarkdownExtension$]: frontmatterToMarkdown('yaml')
    });
  },
  update(realm, params) {
    realm.pubIn({
      [frontmatterYamlType$]: params?.yamlType ?? ""
    });
  }
})
