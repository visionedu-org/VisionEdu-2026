import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthHydration } from "@/components/providers/auth-hydration";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "VisionEdu",
  description:
    "Plataforma de recomposição de aprendizagem e acompanhamento pedagógico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/aileron"
        />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SiteHeader />
          <AuthHydration>
            <main className="flex flex-1 flex-col">{children}</main>
          </AuthHydration>
        </ThemeProvider>
      </body>
    </html>
  );
}
