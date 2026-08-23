import './globals.css';

export const metadata = {
  title: 'Merit Roofing · Variable Comp',
  description: 'Variable compensation tracking',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
