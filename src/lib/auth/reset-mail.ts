import { ADMIN_ROUTES } from "@/constants/routes";
import { getServerEnv } from "@/lib/env/server";
import { captureError } from "@/lib/audit/errorLog";
import { createConfiguredMailService } from "@/lib/mail/nodemailer.provider";

/**
 * Better Auth's reset callback (plan §26.4): the link points at the admin's
 * own reset page with the one-time token, never at Better Auth's routes, which
 * are not exposed. A mail failure is logged and kept from the person asking,
 * who is told the same thing whether or not the email exists.
 */
export async function sendResetPasswordMail({ user, token }: { user: { email: string; name: string }; token: string }) {
  try {
    const resetUrl = new URL(ADMIN_ROUTES.resetPassword, getServerEnv().NEXT_PUBLIC_SITE_URL);
    resetUrl.searchParams.set("token", token);
    await createConfiguredMailService().sendPasswordReset({
      to: user.email,
      name: user.name,
      resetUrl: resetUrl.toString(),
    });
  } catch (error) {
    await captureError({ message: "Password reset email not sent", error });
  }
}
