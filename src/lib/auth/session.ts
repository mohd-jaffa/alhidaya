import { getAuth } from "./auth";

export interface AdminSession {
  adminId: string;
  email: string;
  name: string;
}

/**
 * Who is signed in, read from the session cookie and checked against the
 * database on every call (plan §26.1): the proxy only looks for the cookie.
 */
export async function getAdminSession(headers: Headers): Promise<AdminSession | null> {
  const session = await getAuth().api.getSession({ headers });
  if (!session) return null;
  return { adminId: session.user.id, email: session.user.email, name: session.user.name };
}
