import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lebronsa S.A. | Système d'Inventaire, Équipements & Flotte",
  description: "Plateforme professionnelle d'inventaire d'entreprise pour Lebronsa S.A. : équipements IT, forfaits télécoms, terminaux Starlink, électronique et dotations collaborateurs.",
  icons: {
    icon: "/Lebrunog.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
