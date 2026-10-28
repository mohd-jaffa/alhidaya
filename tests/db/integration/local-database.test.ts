import mysql from "mysql2/promise";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * The local MySQL matches the client's server and keeps the app to data
 * rights only (plan §21.1, §26.1): the guarantees every later row relies on.
 */
const url = process.env.TEST_DATABASE_URL ?? "";
let connection: mysql.Connection;

beforeAll(async () => {
  connection = await mysql.createConnection(url);
});

afterAll(async () => {
  await connection.end();
});

describe("the local database", () => {
  it("is MySQL 8.0.46, the server's version", async () => {
    const [rows] = await connection.query<mysql.RowDataPacket[]>("select version() as version");
    expect(rows[0].version).toBe("8.0.46");
  });

  it("stores text as utf8mb4, ready for Arabic", async () => {
    const [rows] = await connection.query<mysql.RowDataPacket[]>(
      "select default_character_set_name as charset from information_schema.schemata where schema_name = database()",
    );
    expect(rows[0].charset).toBe("utf8mb4");
  });

  it("refuses the app any change to the schema", async () => {
    await expect(connection.query("create table app_must_not_create (id int)")).rejects.toMatchObject({
      code: "ER_TABLEACCESS_DENIED_ERROR",
    });
    await expect(connection.query("drop database alhidaya_test")).rejects.toMatchObject({
      code: "ER_DBACCESS_DENIED_ERROR",
    });
  });
});
