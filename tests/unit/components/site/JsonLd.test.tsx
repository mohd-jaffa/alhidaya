import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JsonLd } from "@/components/site/JsonLd";

describe("JsonLd", () => {
  it("writes the data as JSON-LD, escaped", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: "<b>" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).toBe('{"@type":"Thing","name":"\\u003cb>"}');
  });
});
