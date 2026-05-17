import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/Provider";


const font = Jost({
  subsets: ["latin"],
  weight: ["500", "400", "600"],
});


export const metadata: Metadata = {
  title: "Ветеринарные препараты для всех видов животных в Омске | ЗооВетМир",
  description: "",
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="./favicon.ico" />
        <style>{`
          body {
            font-family: ${font.style.fontFamily};
          }
        `}</style>
      </head>
      <body className={`${font.className}`}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}


