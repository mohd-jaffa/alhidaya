import type { RichText as RichTextBlocks } from "@/lib/validation";

import { ArrowLink } from "./arrow-link";

/**
 * Text the admin writes as blocks (plan §7.2): headings, paragraphs, lists
 * and links, never HTML, at a reading width. A paragraph keeps the admin's
 * line breaks. Its headings sit one level under the section's own.
 */
export function RichText({ blocks, headingLevel = "h2" }: { blocks: RichTextBlocks; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <div className="grid max-w-measure gap-5">
      {blocks.map((block, index) => {
        // Blocks have no ids of their own; their place in the text is theirs.
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "heading":
            return (
              <Heading key={key} className="pt-4 text-section font-medium">
                {block.text.en}
              </Heading>
            );
          case "paragraph":
            return (
              <p key={key} className="whitespace-pre-line">
                {block.text.en}
              </p>
            );
          case "list":
            return (
              <ul key={key} className="grid list-disc gap-2 ps-6 marker:text-forest">
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{item.en}</li>
                ))}
              </ul>
            );
          case "link":
            return (
              <p key={key}>
                <ArrowLink href={block.href}>{block.label.en}</ArrowLink>
              </p>
            );
        }
      })}
    </div>
  );
}
