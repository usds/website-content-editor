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

/*
---
# Page template info (DO NOT EDIT)
layout: default
blog_page: true

# Carousel (Edit this)
carousel_title: "Test page"
carousel_summary: "This is a test page template, it include problematic markdown to make checking it easier"
# partial path to image
carousel_image: /news-and-blog/2024-03-01-test-page-img/icon-512x512.png
# accessibility text for image
carousel_image_alt_text: "Test image"
# should show on news and blog page. ordered by date prefix in filename
carousel_show: true

# Blog detail page (Edit this)
title: "Test page"
dateline_str: "Feb 30, 2024"
readtime_str: "1"
author: "U.S. Digital Service"
permalink: /news-and-blog/test-page-slpm7
basename: "test-page"
tags: [[]]

---

Image found in a Projects posting.
* */
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
  carousel_image: "/img/icon-512x512.png",
  carousel_image_alt_text: "Test image",
  carousel_show: "false",
  tags: [],
};


export const toMarkdownOptions: Options = {
  bullet: "-",
  bulletOther: "+",
  emphasis: "_",
};

