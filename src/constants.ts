import dotenv from "dotenv";

dotenv.config();

export const WORK_DIR_NAME = "project";
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = "bolt_file_modifications";

export const CONSTANTS = {
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  MONGODB_URI: process.env.DATABASE || "mongodb://localhost:27017/bolt",
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  WHITELISTED_IPS: process.env.WHITELISTED_IPS
    ? process.env.WHITELISTED_IPS.split(",")
    : [],
};

export const allowedHTMLElements = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "dd",
  "del",
  "details",
  "div",
  "dl",
  "dt",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "ins",
  "kbd",
  "li",
  "ol",
  "p",
  "pre",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "source",
  "span",
  "strike",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
  "var",
];
