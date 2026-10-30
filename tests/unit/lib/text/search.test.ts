import { MySqlDialect } from "drizzle-orm/mysql-core";
import { describe, expect, it } from "vitest";

import { applications } from "@/db/schema";
import { containing, matchingPerson } from "@/lib/text/search";

const dialect = new MySqlDialect();
const query = (q: string) => dialect.sqlToQuery(matchingPerson(q, applications)!);

describe("an inbox's search", () => {
  it("finds what was typed anywhere, its wildcards meaning themselves", () => {
    expect(containing("Mariam")).toBe("%Mariam%");
    expect(containing("50%_off\\")).toBe("%50\\%\\_off\\\\%");
  });

  it("matches a name and an email as typed, and a phone by its digits once there are three", () => {
    expect(query("Mariam")).toMatchObject({
      sql: "(`applications`.`name` like ? or `applications`.`email` like ?)",
      params: ["%Mariam%", "%Mariam%"],
    });
    expect(query("5551 2345").params).toEqual(["%5551 2345%", "%5551 2345%", "%55512345%"]);
    expect(query("55").params).toHaveLength(2);
  });
});
