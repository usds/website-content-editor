import {ButtonWithTooltip} from "@mdxeditor/editor"
import React from "react";
import {useCellValues, usePublisher} from "@mdxeditor/gurx";
import {hasFrontmatterCustom$, insertFrontmatterCustom$} from "./index.ts";
import classNames from "classnames";
import styles from '../../styles/mdxeditor.copy.module.css';
// @ts-expect-error `?react` uses svgr syntax sugar that linter doesn't understand
import CrabSVG from "../../img/crab-clean.svg?react";

/**
 * A toolbar button that allows the user to insert a {@link https://jekyllrb.com/docs/front-matter/ | front-matter} editor (if one is not already present).
 * For this to work, you need to have the `frontmatterPlugin` plugin enabled.
 * @group Toolbar Components
 */
export const InsertFrontmatterCustom: React.FC = () => {
  const insertFrontmatter = usePublisher(insertFrontmatterCustom$)
  const [hasFrontmatter] = useCellValues(hasFrontmatterCustom$)

  return (
    <ButtonWithTooltip
      title={hasFrontmatter ? 'Edit Page Info' : 'Insert Page Info'}
      className={classNames({
        [styles.activeToolbarButton]: hasFrontmatter
      })}
      onClick={() => insertFrontmatter()}
    >
    <CrabSVG />
    </ButtonWithTooltip>
  )
}
