import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/premium")({
  head: () => ({
    meta: [
      { title: "พรีเมียมฟรี 30 วัน | Horathai AI" },
      {
        name: "description",
        content:
          "ปลดล็อกรายงานดวงเชิงลึก โหร AI ไม่จำกัด และพยากรณ์ดาวย้ายรายเดือน ทดลองฟรี 30 วัน",
      },
      { property: "og:title", content: "พรีเมียมฟรี 30 วัน | Horathai AI" },
      {
        property: "og:description",
        content: "ไม่ต้องใช้บัตรเครดิต ยกเลิกได้ทุกเมื่อ พร้อมรายงานดวงเชิงลึกฉบับเต็ม",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/wallet", search: { checkout: "packages", returnTo: undefined } });
  },
});
