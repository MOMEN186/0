import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import NavBar from "@/components/header/navbar";
import Footer from "@/components/footer";
import Script from "next/script";
import QueryProvider from "@/providers/query-provider";
import { PublicEnvScript } from "next-runtime-env";
import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ClientOnly from "@/components/ClientOnly";
import "artplayer"; // brings in default skin via JS
import dynamic from "next/dynamic";

const FirebaseAuthProvider = dynamic(
  () => import("@/providers/fireBaseAuthProvider"),
  { ssr: false }
);

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

const APP_NAME = "UNEX ANIME";
const APP_DEFAULT_TITLE = "UnexAnime – Watch Anime Online Free in HD (Sub & Dub)";
const APP_DESCRIPTION = "Watch anime online for free in HD. Stream the latest subbed and dubbed episodes instantly with fast servers on UnexAnime — no sign-up required.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: APP_DEFAULT_TITLE,
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      
        <meta name="mobile-web-app-capable" content="yes"></meta>
        <meta name="monetag" content="131167917e3df270be7693e6a5f78edc" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X9RZ58XPH1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-X9RZ58XPH1');`}
        </Script>
        <PublicEnvScript />
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <Script
          src="https://fpyf8.com/88/tag.min.js"
          data-zone="157084"
          async
          data-cfasync="false"
          strategy="afterInteractive"
        />
     
      </head>
      <body
        className={`${geistSans.className} antialiased max-w-[100vw] overflow-x-hidden`}
      >
        <ClientOnly>
          <FirebaseAuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <QueryProvider>
                <NavBar />
                {children}
                <Footer />
                <Toaster />
              </QueryProvider>
            </ThemeProvider>
          </FirebaseAuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
