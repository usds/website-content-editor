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

export interface ImpactStatementField {
  figure: string;
  unit: string; // e.g. "%" "M"
  description: string;
}

export interface FrontMatterFields {
  title: string;
  date: string;
  readtime_minutes: number;
  author: string;
  permalink: string;
  basename: string; // used for MD filename and image directory name

  // project pages use these
  agency: string;
  project_url: string;
  impact_statement: ImpactStatementField[];

  carousel_title: string;
  carousel_summary: string;
  carousel_image: string;
  carousel_image_alt_text: string;
  carousel_show: "true"|"false";
  tags: string[];
}

export const BLANK_FRONTMATTER_FIELDS: FrontMatterFields = {
  title: "",
  date: "",
  readtime_minutes: 1,
  author: DEFAULT_AUTHOR,
  permalink: "",
  basename: "",

  agency: "",
  project_url: "",
  impact_statement: [],


  carousel_title: "",
  carousel_summary: "",
  carousel_image: "",
  carousel_image_alt_text: "",
  carousel_show: "true",
  tags: [],
};

export const STARTER_BLOG_FRONTMATTER_FIELDS: FrontMatterFields = {
  title: "News and blog page",
  date: getShortDate(new Date().toDateString()),
  readtime_minutes: 1,
  author: DEFAULT_AUTHOR,
  permalink: "/news-and-blog/news-and-blog-page-tmpl1234",
  basename: "news-and-blog-page",
  agency: "",
  project_url: "",
  impact_statement: [],
  carousel_title: "News and blog page",
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

