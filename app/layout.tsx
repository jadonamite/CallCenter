import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/shell/sidebar";
import { BottomNav } from "@/components/shell/bottom-nav";
import { buildTree, getGroups } from "@/lib/groups";
import { loadContacts, activePlanWindow } from "@/lib/live-data";
import { getSession } from "@/lib/auth";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Outreach Call Center",
  description: "Follow-up and data collation dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const groups = await getGroups();
  const plan = await activePlanWindow();
  const contacts = await loadContacts(buildTree(groups));
  const reached = contacts.filter((c) => c.contactedDay !== null).length;
  const daysLeft = Math.max(plan.days - plan.todayIndex - 1, 0);
  const session = await getSession();
  const identity = session
    ? { role: session.role, name: session.role === "caller" ? session.name : undefined }
    : null;

  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Sidebar reached={reached} target={plan.target} daysLeft={daysLeft} identity={identity} />
          <div className="flex-1 pb-24 md:pb-0 md:pl-16 lg:pl-60">{children}</div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
