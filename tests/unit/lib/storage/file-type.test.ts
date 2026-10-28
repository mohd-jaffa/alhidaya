import { describe, expect, it } from "vitest";

import { detectFileType } from "@/lib/storage/file-type";

const bytes = (...parts: (number[] | string)[]) =>
  new Uint8Array(parts.flatMap((part) => (typeof part === "string" ? Array.from(part, (c) => c.charCodeAt(0)) : part)));

describe("detectFileType", () => {
  it("reads each allowed type from its first bytes", () => {
    expect(detectFileType(bytes([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpeg");
    expect(detectFileType(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("png");
    expect(detectFileType(bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "))).toBe("webp");
    expect(detectFileType(bytes([0, 0, 0, 0x1c], "ftypavif"))).toBe("avif");
    expect(detectFileType(bytes([0, 0, 0, 0x1c], "ftypavis"))).toBe("avif");
    expect(detectFileType(bytes("%PDF-1.7"))).toBe("pdf");
    expect(detectFileType(bytes([0x50, 0x4b, 0x03, 0x04], "....[Content_Types].xml..word/document.xml"))).toBe("docx");
    expect(detectFileType(bytes([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))).toBe("doc");
  });

  it("refuses what it does not recognise, whatever the name says", () => {
    expect(detectFileType(bytes("<svg xmlns='http://www.w3.org/2000/svg'><script>"))).toBeNull();
    expect(detectFileType(bytes("<?php echo 1;"))).toBeNull();
    expect(detectFileType(bytes([0x50, 0x4b, 0x03, 0x04], "a zip of anything else"))).toBeNull();
    expect(detectFileType(bytes([0, 0, 0, 0x1c], "ftypmp42"))).toBeNull();
    expect(detectFileType(bytes("RIFF", [0, 0, 0, 0], "WAVE"))).toBeNull();
    expect(detectFileType(new Uint8Array())).toBeNull();
  });
});
