import { MotionProvider } from "@/components/motion/MotionProvider";

/** The public site: its motion lives here, so the admin never loads it (plan §30.4). */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <MotionProvider>{children}</MotionProvider>;
}
