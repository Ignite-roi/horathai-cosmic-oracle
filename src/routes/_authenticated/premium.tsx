import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/premium")({
  head: () => ({
    meta: [
      { title: "แพ็กเกจวันใช้งาน | Horathai AI" },
      {
        name: "description",
        content:
          "รายละเอียดแพ็กเกจวันใช้งาน ราคา และสถานะการเชื่อม Payment Gateway ของ Horathai AI",
      },
      { property: "og:title", content: "แพ็กเกจวันใช้งาน | Horathai AI" },
      {
        property: "og:description",
        content: "ดูราคาและเงื่อนไขแพ็กเกจ โดยยังไม่เปิดรับชำระเงินจริงในรอบตรวจเว็บไซต์",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/wallet", search: { checkout: "packages", returnTo: undefined } });
  },
});
