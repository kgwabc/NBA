import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUserWithTeam } from "@/lib/currentUser";
import { TeamThemeProvider } from "@/app/components/TeamThemeProvider";
import TeamBackground from "@/app/components/TeamBackground";
import FavoriteTeamBanner from "@/app/components/FavoriteTeamBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NBA NIGHT NIGHT",
  description: "NBA 30개 팀을 소개하는 웹사이트",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, team: initialTeam } = await getCurrentUserWithTeam();

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TeamThemeProvider initialTeam={initialTeam}>
          <TeamBackground />
          <FavoriteTeamBanner isLoggedIn={!!session} />
          {children}
        </TeamThemeProvider>
      </body>
    </html>
  );
}
