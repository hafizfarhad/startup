import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { changelogEntrySchema, nexusRowSchema, toolRowSchema } from "./lib/schemas";

type Row = Record<string, unknown>;

const withIdFrom = (key: string) => (text: string): Row[] =>
  (JSON.parse(text) as Row[]).map((row) => ({ ...row, id: String(row[key]) }));

const changelogParser = (text: string): Row[] =>
  (JSON.parse(text) as Row[]).map((row, index) => ({ ...row, id: `${String(row.date)}-${index}` }));

export const collections = {
  usNexus: defineCollection({
    loader: file("data/us-economic-nexus.json", { parser: withIdFrom("code") }),
    schema: nexusRowSchema,
  }),
  tools: defineCollection({
    loader: file("data/tools.json", { parser: withIdFrom("slug") }),
    schema: toolRowSchema,
  }),
  changelog: defineCollection({
    loader: file("data/changelog.json", { parser: changelogParser }),
    schema: changelogEntrySchema,
  }),
};
