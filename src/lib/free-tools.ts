/**
 * Every free tool, in one list for the tool-page chips and the footer.
 * Types without their own page open the main generator with ?type= preselected.
 */
export const FREE_TOOLS: Array<{ href: string; label: string; footer: string }> = [
  { href: "/qr-code-generator", label: "Link", footer: "QR code generator" },
  { href: "/wifi-qr-code-generator", label: "WiFi", footer: "WiFi QR code" },
  { href: "/vcard-qr-code-generator", label: "Contact", footer: "vCard QR code" },
  { href: "/qr-code-generator?type=text", label: "Text", footer: "Text QR code" },
  { href: "/qr-code-generator?type=email", label: "Email", footer: "Email QR code" },
  { href: "/qr-code-generator?type=sms", label: "SMS", footer: "SMS QR code" },
  { href: "/qr-code-generator?type=phone", label: "Phone", footer: "Phone QR code" },
  { href: "/restaurant-menu-qr-code#table-cards", label: "Menu table cards", footer: "Menu table cards" },
  { href: "/wifi-qr-code-generator#wifi-sign", label: "WiFi sign", footer: "Printable WiFi sign" },
  { href: "/#short-link", label: "Short link", footer: "URL shortener" },
];
