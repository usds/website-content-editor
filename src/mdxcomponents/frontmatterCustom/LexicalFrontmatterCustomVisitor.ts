import * as Mdast from 'mdast'
import { FrontmatterCustomNode, $isFrontmatterCustomNode } from './FrontmatterCustomNode.tsx'
import {LexicalExportVisitor} from "@mdxeditor/editor";

export const LexicalFrontmatterCustomVisitor: LexicalExportVisitor<FrontmatterCustomNode, Mdast.Yaml> = {
  testLexicalNode: $isFrontmatterCustomNode,
  visitLexicalNode: ({ actions, lexicalNode }) => {
    actions.addAndStepInto('yaml', { value: lexicalNode.getYaml() })
  }
}
