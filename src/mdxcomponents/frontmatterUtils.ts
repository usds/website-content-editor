// great primary https://404wolf.com/posts/blog/imageBlocks
import YamlParser from "js-yaml";
import {
  BLANK_BLOG_FRONTMATTER_FIELDS,
  BlogFrontMatterFields,
  DEFAULT_AUTHOR,
  toMarkdownOptions
} from "../types/commontypes.ts";
import {fromMarkdown} from "mdast-util-from-markdown";
import {gfm} from "micromark-extension-gfm";
import {gfmFromMarkdown, gfmToMarkdown} from "mdast-util-gfm";
import {frontmatter} from "micromark-extension-frontmatter";
import {mdxFromMarkdown, mdxToMarkdown} from "mdast-util-mdx";
import {frontmatterFromMarkdown, frontmatterToMarkdown} from "mdast-util-frontmatter";
import {toMarkdown} from "mdast-util-to-markdown";
import {mdxjs} from "micromark-extension-mdxjs";
import * as Mdast from 'mdast'
import {
  getFilnamePartOfUrlPath,
  getShortDate,
  shortDateToNanoId,
  toUTCDate,
} from "../misc.ts";
import {showToast} from "../components/showToast.tsx";
import JSZip from "jszip";


export const yamlToBlogFields = (yamlstr: string): BlogFrontMatterFields => {
  if (yamlstr.trim().length === 0) {
    return BLANK_BLOG_FRONTMATTER_FIELDS;
  }
  const data = YamlParser.load(yamlstr) as Record<string, string>;

  const author = data?.author ?? data?.byline_str ?? ""; // fallback logic for old format

  // if we make every field a string, then this becomes easy.
  // Might be some reflection way to do this? Going to be verbose the first time.
  // maybe json.parse could be used more?
  const result: BlogFrontMatterFields = {
    title: data.title ?? BLANK_BLOG_FRONTMATTER_FIELDS.title,
    date: data.date ?? data.dateline_str ?? BLANK_BLOG_FRONTMATTER_FIELDS.date,
    readtime_minutes: parseInt(data.readtime_minutes ?? data.readtime_str ?? BLANK_BLOG_FRONTMATTER_FIELDS.date),
    author: author.length ? author : BLANK_BLOG_FRONTMATTER_FIELDS.author,
    permalink: data.permalink ?? BLANK_BLOG_FRONTMATTER_FIELDS.permalink,
    tags: [], // todo: fix
    basename: data.basename ?? BLANK_BLOG_FRONTMATTER_FIELDS.basename,

    carousel_title: data.carousel_title ?? BLANK_BLOG_FRONTMATTER_FIELDS.carousel_title,
    carousel_summary: data.carousel_summary ?? BLANK_BLOG_FRONTMATTER_FIELDS.carousel_summary,
    carousel_image: data.carousel_image ?? BLANK_BLOG_FRONTMATTER_FIELDS.carousel_image,
    carousel_image_alt_text: data.carousel_image_alt_text ?? BLANK_BLOG_FRONTMATTER_FIELDS.carousel_image_alt_text,
    carousel_show: (data.carousel_show === "true" ? "true" : BLANK_BLOG_FRONTMATTER_FIELDS.carousel_show),
  };
  return result;
}


export const getYamlBlogHeader = (fields: BlogFrontMatterFields): string => {
  const tags = '[' + fields.tags?.map(s => `'${s}'`).join(',') + ']';
  return `# Page template info (DO NOT EDIT)
layout: default
blog_page: true

# Blog detail page (Edit this)
title: "${fields.title}"
date: "${fields.date}"
readtime_minutes: "${fields.readtime_minutes}"
author: "${fields.author}"
permalink: ${fields.permalink}
basename: "${fields.basename}"
tags: [${tags}]

# Carousel (Edit this)
carousel_title: "${fields.carousel_title}"
carousel_summary: "${fields.carousel_summary}"
# partial path to image
carousel_image: ${fields.carousel_image}
# accessibility text for image
carousel_image_alt_text: "${fields.carousel_image_alt_text}"
# should show on news and blog page. ordered by date prefix in filename
carousel_show: ${fields.carousel_show ? "true" : "false"}
`;
}

export const generateBasename = (title: string): string => {
  // (/[^0-9a-z]/gi, '')
  return title.toLowerCase()
    .replace(/[^0-9a-z ]/gi, '') // removes ' and other odd characters
    .replace(/\W/g, '-'); // replaces whitespace with -

  // Title could be so long it makes for a bad url. This doesn't include the prefix part
  // of `https://usds.gov/news-and-blog` which is 30 character.

  // if (result.length > MAX_TITLE_LEN_FOR_URL) {
  //   // we hit the max size, make it smaller
  //   result = result.slice(0, MAX_TITLE_LEN_FOR_URL-7); // -7 is for adding back in pseudo random code suffix
  //   result = result.slice(0, result.lastIndexOf("-")); // work back to last "-" to not get partial words.
  // }
  // return result;
}

/**
 * Just trying to consolidate all the url building to a single location.
 */
export const generateFields = (fields: BlogFrontMatterFields): {
  basename?: string, // if this is undefined, then function failed
  imagedir?: string,  // references the -img/ directory
  carousel_imagepath_formd?: string, // starts with /news-and-blog, used in MD
  mdfilename?: string,
  permalink?: string,
  datedbasename?: string,
} => {
  if (fields.title.length === 0) {
    showToast("You need to supply a title and date first", "error");
    return {};
  }
  if (fields.date.length === 0) {
    // just default to today's date
    fields.date = getShortDate();
  }
  const basename = (fields.basename.length) ? fields.basename : generateBasename(fields.title);
  const randomStr = shortDateToNanoId(fields.date);
  const dateprefix = toUTCDate(fields.date);
  const datedbasename = `${dateprefix}-${basename}`;

  // const permalink = `/news-and-blog/${fixedTitle}-${randomStr}`.replace("--", "-");
  // the `/news-and-blog/` part is ONLY for the preview/carousel image!
  const imagedir = `${datedbasename}-img`.replace("--", "-");
  const carousel_imagepath_formd = `/news-and-blog/${imagedir}`;
  const mdfilename = `${datedbasename}.md`.replace("--", "-");
  const permalink = `/news-and-blog/${basename}-${randomStr}`.replace("--", "-");

  return {basename, imagedir, carousel_imagepath_formd, mdfilename, datedbasename, permalink};
};

export const blogFieldsFixup = (fields: BlogFrontMatterFields): BlogFrontMatterFields => {
  if (fields.title.trim() === "") {
    showToast("Must have a title to continue.", "error");
    return fields;
  }

  if (fields.date.length === 0) {
    // just default to today's date
    fields.date = getShortDate();
  }
  // used if any item is missing.
  const {basename, imagedir, carousel_imagepath_formd, mdfilename, datedbasename, permalink} = generateFields(fields);
  if (fields.basename.trim() === "") {
    fields.basename = basename ?? "";
  }
  if (fields.permalink.trim() === "") {
    fields.permalink = permalink ?? "";
  }
  if (fields.carousel_title.length === 0) {
    fields.carousel_title = fields.title;
  }
  if (fields.author.trim() === "") {
    fields.author = DEFAULT_AUTHOR;
  }

  // we force the image to be in the subdirectory, but we could be more flexible.
  if (fields.carousel_summary.trim() === "") {
    showToast("Missing Preview/Carousel Information. You'll need to add one before downloading.", "warning");
  } else if (fields.carousel_image.trim() === "") {
    showToast("Missing Preview/Carousel image. You'll need to add one before downloading.", "warning");
  } else {
    const filename = getFilnamePartOfUrlPath(fields.carousel_image);
    fields.carousel_image = `${carousel_imagepath_formd}/${filename}`;
  }

  return fields;
}

function isParent(node: unknown): node is Mdast.Parent {
  return (node as { children?: unknown[] }).children instanceof Array
}

interface SaveDataType {
  yamlFields: BlogFrontMatterFields;
  imagesFromMd: string[];
  markdownFixedStr: string; // fixes the cache image links to use zip save director
}

// gfmAutolinkLiteralFromMarkdown
export const getSaveDataFromMd = (mdstring: string): SaveDataType => {
  try {
    const result: SaveDataType = {yamlFields: yamlToBlogFields(""), imagesFromMd: [], markdownFixedStr: mdstring};
    const mdastRoot = fromMarkdown(mdstring, {
      extensions: [gfm(), frontmatter(['yaml']), mdxjs()],
      mdastExtensions: [gfmFromMarkdown(), frontmatterFromMarkdown(), mdxFromMarkdown()],
    });

    if (mdastRoot.children.length === 0) {
      return result;
    }

    // yaml will be in the first slot
    const yaml = mdastRoot.children[0]?.type === "yaml" ? mdastRoot.children[0].value : "";
    result.yamlFields = yamlToBlogFields(yaml);
    const imgpath = result.yamlFields.carousel_image.split("/").slice(-2)[0] ?? "missing_carousel_image";

    let queue = [...mdastRoot.children];
    while (queue.length) {
      const current = queue.pop();
      if (current?.type === "image") {
        result.imagesFromMd.push(current.url);

        // fix up the path in place, it's a reference so
        const filename = current.url.split("/").slice(-1)[0];
        current.url = `${imgpath}/${filename}`;
      }
      if (isParent(current)) {
        queue = [...queue, ...current.children];
      }
    }

    // now convert the dmast back to markdown with the fixed image paths, wish we could call exportMarkdownFromLexical
    result.markdownFixedStr = toMarkdown(mdastRoot,
      {
        ...toMarkdownOptions,
        extensions: [gfmToMarkdown(), frontmatterToMarkdown(['yaml']), mdxToMarkdown()]
      });

    return result;
  } catch (err) {
    console.error(err);
  }
  return {yamlFields: yamlToBlogFields(""), imagesFromMd: [], markdownFixedStr: mdstring};
}

export const saveDataToZip = async (markdownstr: string) => {
// extract out the frontmatter yaml and all image links (these are in the cache)
  const {yamlFields, imagesFromMd, markdownFixedStr} = getSaveDataFromMd(markdownstr);
  const {
    basename,
    imagedir,
    carousel_imagepath_formd,
    mdfilename,
    // datedbasename,
    permalink
  } = generateFields(yamlFields);

  if (!basename?.length || !imagedir?.length || !carousel_imagepath_formd?.length || !mdfilename?.length || !permalink?.length ||
    !yamlFields.carousel_summary.trim().length || !yamlFields.carousel_image.trim().length) {
    // this really only needs the title to work
    showToast(`Some required fields are not filled out. Going to save anyways, but double check`, "error");
  }
// const webcache = await caches.open(CACHE_NAME);
  const zip = JSZip(); // instance of JSZip

// add the formatted md to the zip, use the filename from
  {
    // do we need to sanity check markdown's yaml?
    zip.file(mdfilename ?? "missing-title.md", markdownFixedStr);
  }

// add the carousel_image to this list of imgs to be downloaded
  {
    // normalize the carousel image
    const filename = getFilnamePartOfUrlPath(yamlFields.carousel_image) ?? "missing-image.jpg";
    imagesFromMd.push(`${imagedir}/${filename}`);
  }

  for (const eachimgsr of imagesFromMd) {
    const response = await fetch(eachimgsr);
    if (!response.ok) {
      console.error(`failed to fetch "${eachimgsr}"`, response);
      continue;
    }
    const blob = await response.blob();
    const filename = getFilnamePartOfUrlPath(eachimgsr);
    zip.file(`${imagedir}/${filename}`, blob);
  }

// now generat the zip file and trigger a "download" prompt
  {
    const zipData = await zip.generateAsync({
      type: "blob",
      streamFiles: true,
    });
    console.log(zipData);
    // Create a download link for the zip file
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(zipData);
    link.download = `${basename}.zip`;
    link.click();
  }
};

export const getDefaultMarkdown = (): string => {
  const yamlHeader = getYamlBlogHeader(BLANK_BLOG_FRONTMATTER_FIELDS);
  return `---\n${yamlHeader}\n---\n\nPaste content here`;
}
