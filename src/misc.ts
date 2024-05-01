import moment from "moment";
import {MDXEditorMethods} from "@mdxeditor/editor";
import {CACHE_NAME} from "./types/commontypes.ts";


export const getFilnamePartOfUrlPath = (pathstr?: string) => pathstr?.split("/")?.pop()?.split("?")[0] ?? undefined;

export const forceTypeBoolean = (value: string | null | boolean): boolean | null =>
  typeof value === 'boolean' ? value : value === 'true' ? true : value === 'false' ? false : null;

export const toUTCDate = (date: string | Date | undefined): string => {
  if ((typeof date === "string") && (date.trim().length === 0 || date === "Invalid date")) {
    date = undefined;
  }
  // have to be careful of the timezone shifting days because of UTC offsets.
  // e.g. Date("1/1/2020") gets turned into "Dec 31, 2019"
  // But "Jan 1, 2020" doesn't get converted. Such a horrible API.
  // so, we're using moment.js
  const dateObj = moment(date);
  return dateObj.toISOString().split("T")[0] || ""
}

export const getShortDate = (dateStr = ""): string => {
  const dateObj = moment(dateStr);
  return dateObj.format("MMM D, YYYY");
}

export const shortDateToNanoId = (dateStr: string): string => {
  const dateObj = moment(dateStr);
  const tempresult = Number(dateObj.unix()).toString(31);  // this has vowels so bad words could be generated.
  // 36 => 0-9a-z. 31 would remove vowels (except y)
  // `0123456789abcdefghijklmnopqrstu` `vwxyz`
  // Timestamp often starts the same leading character and ends with "0" so just remove.
  // `lqw277k0` => `qw277k`
  tempresult.replace('a', 'v')
  return tempresult
    .replace('a', 'v')
    .replace('e', 'w')
    .replace('i', 'x')
    .replace('o', 'z')
    .substring(1, tempresult.length - 1);
}

export const cleanupFilename = (inStr: string): string => {
  // this sure does seem like a bug in eslint. Everything is set to "es2021" everywhere.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const filePathClean: string = inStr.replaceAll("..", "") as string; // sanitize
  const fileExtOffset = filePathClean.lastIndexOf(".");
  const filename = filePathClean.substring(0, fileExtOffset)
    .replace(/\W/gi, '-')
    .replace("--", "-");
  const suffix = filePathClean.substring(fileExtOffset);
  return `${filename}${suffix}`;
}

export const devResetEverything = async (mdxeditorref: React.RefObject<MDXEditorMethods>,) => {
  mdxeditorref.current?.setMarkdown("");
  await caches.delete(CACHE_NAME);
  localStorage.clear();
  window.location.reload();
}
