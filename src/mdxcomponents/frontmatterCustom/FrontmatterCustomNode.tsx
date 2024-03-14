import { DecoratorNode, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical'
import React from "react";
import {FrontmatterCustomEditor} from "./FrontmatterCustomEditor.tsx";
import {yamlToBlogFields} from "../frontmatterUtils.ts";

/**
 * A serialized representation of an {@link FrontmatterCustomNode}.
 */
export type SerializedFrontmatterNode = Spread<
  {
    yaml: string
    version: 1
  },
  SerializedLexicalNode
>

/**
 * Represents {@link https://daily-dev-tips.com/posts/what-exactly-is-frontmatter/ | the frontmatter} of the markdown document.
 * Use {@link "$createFrontmatterNode"} to construct one.
 */
export class FrontmatterCustomNode extends DecoratorNode<React.JSX.Element> {
  __yaml: string

  static getType(): string {
    return 'frontmatter'
  }

  static clone(node: FrontmatterCustomNode): FrontmatterCustomNode {
    return new FrontmatterCustomNode(node.__yaml, node.__key)
  }

  static importJSON(serializedNode: SerializedFrontmatterNode): FrontmatterCustomNode {
    const { yaml } = serializedNode
    const node = $createFrontmatterCustomNode(yaml)
    return node
  }

  constructor(code: string, key?: NodeKey) {
    super(key)
    this.__yaml = code
  }

  exportJSON(): SerializedFrontmatterNode {
    return {
      yaml: this.getYaml(),
      type: 'frontmatter',
      version: 1
    }
  }

  // View - returns standard dom elements NOT react
  createDOM(_config: EditorConfig) {
    const yamlStr = this.getYaml();
    const fields = yamlToBlogFields(yamlStr);

    const newDiv = document.createElement("div");
    newDiv.className = "frontmatterComponent";

    if (yamlStr.trim() === "") {
      newDiv.innerHTML = ''; // things get confusing when pasted into the document without a frontmatter
      return newDiv;
    }

    if (fields.title.trim() === "" && fields.date.trim() === "") {
      // assume this is a new template and show condensed ui
      newDiv.innerHTML = `
        <div class="usa-alert usa-alert--info">
          <div class="usa-alert__body">
            <h4 class="usa-alert__heading">Getting Started</h4>
            <p class="usa-alert__text">
              Click the <span class="inline-img-graphics"><img src="./img/crab-clean.svg"/></span> button in 
              the toolbar to edit page meta information.<br/><br/>
              Content is saved on your local browser, so refreshing won't lose edits.<br/><br/>
              This is a public site, but NOT content or text every leaves your local machine.<br/><br/>
            </p>
          </div>
        </div>
      `;
      return newDiv;

    }

    // language=HTML
    newDiv.innerHTML = `
      <div class="border-dotted-light">
        <div class="grid-container news-container">
          <section class="site-c-section">
            <div class="site-c-section__body">
              <ul class="site-c-cards margin-x-neg-2 grid-row">
                <li class="tablet:grid-col-6 desktop:grid-col-4">
                </li>
                <li class="tablet:grid-col-6 desktop:grid-col-4">
                  <span class="site-c-card site-c-card--linked"><!-- span instead of link? -->
                    <img src="${fields.carousel_image}"
                         alt="${fields.carousel_image_alt_text}" 
                         class="site-c-card__image"
                         crossorigin="anonymous"/>
                    <div class="site-c-card__body">
                      <span class="site-c-flag">${fields.date}</span>
                      <h3 class="site-c-card__title">${fields.carousel_title}</h3>
                      <div class="usa-prose margin-top-2">
                        <p>${fields.carousel_summary}</p>
                        <p class="site-c-card__affordance" aria-hidden="true">Read full post</p>
                      </div>
                    </div>
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </div>
        <header class="padding-y-5">
          <span class="site-c-flag">News &amp; blog</span>
          <h1>${fields.title}</h1>
          <div class="site-c-blog-dateline">
            ${fields.date}
            - ${fields.readtime_minutes} min read
          </div>
          <div class="site-c-blog-byline">By: ${fields.author}</div>
        </header>
        <hr aria-hidden="true" />
      </div>
    `;
    return newDiv;
  }

  updateDOM(): boolean {
    return true;
  }

  getYaml(): string {
    return this.getLatest().__yaml
  }

  setYaml(yaml: string) {
    if (yaml !== this.__yaml) {
      this.getWritable().__yaml = yaml
    }
  }

  decorate(editor: LexicalEditor): React.JSX.Element {
    return (
      <FrontmatterCustomEditor
        yaml={this.getYaml()}
        onChange={(yaml) => {
          editor?.update(() => this.setYaml(yaml))
          }
        }
      />
    )
  }
}

/**
 * Creates a {@link FrontmatterCustomNode}.
 * @param yaml - The YAML string of the frontmatter.
 */
export function $createFrontmatterCustomNode(yaml: string): FrontmatterCustomNode {
  return new FrontmatterCustomNode(yaml)
}

/**
 * Returns `true` if the given node is a {@link FrontmatterCustomNode}.
 */
export function $isFrontmatterCustomNode(node: LexicalNode | null | undefined): node is FrontmatterCustomNode {
  return node instanceof FrontmatterCustomNode
}
