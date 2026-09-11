import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(here, "..", "i18n", "index.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const marker = "const resources =";
const markerIndex = source.indexOf(marker);

if (markerIndex < 0) {
  throw new Error(`Could not find ${marker} in ${sourcePath}`);
}

const objectStart = source.indexOf("{", markerIndex);
let depth = 0;
let quote = null;
let escaped = false;
let objectEnd = -1;

for (let index = objectStart; index < source.length; index += 1) {
  const character = source[index];

  if (quote) {
    if (escaped) {
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === quote) {
      quote = null;
    }
    continue;
  }

  if (character === "'" || character === '"' || character === "`") {
    quote = character;
  } else if (character === "{") {
    depth += 1;
  } else if (character === "}") {
    depth -= 1;
    if (depth === 0) {
      objectEnd = index + 1;
      break;
    }
  }
}

if (objectEnd < 0) {
  throw new Error("Could not locate the end of the i18n resources object");
}

const resources = Function(`"use strict"; return (${source.slice(objectStart, objectEnd)});`)();
const expectedLocales = ["en", "ar", "fr", "es", "zh-CN"];

function flatten(value, prefix = "", output = {}) {
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object") {
      flatten(child, fullKey, output);
    } else {
      output[fullKey] = child;
    }
  }
  return output;
}

const localeNames = Object.keys(resources);
const english = flatten(resources.en?.translation ?? {});
const errors = [];

if (JSON.stringify(localeNames) !== JSON.stringify(expectedLocales)) {
  errors.push(`Expected locales ${expectedLocales.join(", ")}, found ${localeNames.join(", ")}`);
}

for (const locale of expectedLocales) {
  const translation = resources[locale]?.translation;
  if (!translation) {
    errors.push(`${locale}: missing translation namespace`);
    continue;
  }

  const flattened = flatten(translation);
  for (const key of Object.keys(english)) {
    if (!(key in flattened)) {
      errors.push(`${locale}: missing key ${key}`);
    } else if (typeof flattened[key] !== "string" || flattened[key].trim() === "") {
      errors.push(`${locale}: empty or non-string value for ${key}`);
    }
  }

  for (const key of Object.keys(flattened)) {
    if (!(key in english)) {
      errors.push(`${locale}: unexpected key ${key}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`i18n validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `i18n validation passed: ${localeNames.length} locales, ${Object.keys(english).length} keys, no missing or unexpected entries.`,
);