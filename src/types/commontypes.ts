// keep in sync with service-worker.js
import {Options} from "mdast-util-to-markdown";
import {getShortDate} from "../misc.ts";

// these are kind of just a dumping ground. reorganize
export const READING_WORDS_PER_MINUTE = 220;
export const TRUNCATE_SUMMARY_LENGTH = 250;
export const MAX_TITLE_LEN_FOR_URL = 80;
export const DEFAULT_AUTHOR = "U.S. Digital Service";


export const CACHE_NAME = "mdedit-cache-v1";
export const MARKDOWN_LOCAL_STORAGE_KEY = "savedMarkdown";

export interface BlogFrontMatterFields {
  title: string;
  date: string;
  readtime_minutes: number;
  author: string;
  permalink: string;
  basename: string; // used for MD filename and image directory name

  carousel_title: string;
  carousel_summary: string;
  carousel_image: string;
  carousel_image_alt_text: string;
  carousel_show: "true"|"false";
  tags: string[];
}

export const BLANK_BLOG_FRONTMATTER_FIELDS: BlogFrontMatterFields = {
  title: "",
  date: "",
  readtime_minutes: 1,
  author: DEFAULT_AUTHOR,
  permalink: "",
  basename: "",
  carousel_title: "",
  carousel_summary: "",
  carousel_image: "",
  carousel_image_alt_text: "",
  carousel_show: "false",
  tags: [],
};

export const STARTER_BLOG_FRONTMATTER_FIELDS: BlogFrontMatterFields = {
  title: "New news and blog page",
  date: getShortDate(new Date().toDateString()),
  readtime_minutes: 1,
  author: DEFAULT_AUTHOR,
  permalink: "/news-and-blog/new-news-and-blog-page-tmpl7",
  basename: "new-news-and-blog-page",
  carousel_title: "New news and blog page",
  carousel_summary: `This is a blank news-and-blog page template. Click the crab icon to edit metadata. 
  Enter new content below this header preview`,
  carousel_image: "https://usds.github.io/website-content-editor/img/template-carousel.jpg",
  carousel_image_alt_text: "Test image",
  carousel_show: "false",
  tags: [],
};


export const toMarkdownOptions: Options = {
  bullet: "-",
  bulletOther: "+",
  emphasis: "_",
};

