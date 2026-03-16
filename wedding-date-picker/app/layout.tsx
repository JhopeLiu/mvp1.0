import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "婚礼择日助手",
  description: "AI 辅助婚礼择日原型应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
