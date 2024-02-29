import * as Mdast from 'mdast'
import { $createFrontmatterCustomNode } from './FrontmatterCustomNode.tsx'
import {MdastImportVisitor} from "@mdxeditor/editor";

export const MdastFrontmatterCustomVisitor: MdastImportVisitor<Mdast.Yaml> = {
  testNode: 'yaml',
  visitNode({ mdastNode, actions }) {
    actions.addAndStepInto($createFrontmatterCustomNode(mdastNode.value))
  }
}
