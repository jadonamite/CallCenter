import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/shell/sidebar";
import { BottomNav } from "@/components/shell/bottom-nav";
import { buildTree, getGroups } from "@/lib/groups";
import { PLAN_DAYS, PLAN_TARGET, TODAY_INDEX } from "@/lib/data";
import { loadContacts } from "@/lib/live-data";
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
  const contacts = await loadContacts(buildTree(groups));
  const reached = contacts.filter((c) => c.contactedDay !== null).length;
  const daysLeft = Math.max(PLAN_DAYS - TODAY_INDEX - 1, 0);

  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Sidebar reached={reached} target={PLAN_TARGET} daysLeft={daysLeft} />
          <div className="flex-1 pb-24 md:pb-0 md:pl-16 lg:pl-60">{children}</div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
