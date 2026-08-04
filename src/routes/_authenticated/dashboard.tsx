import { createFileRoute } from "@tanstack/react-router";

import { DashboardHome } from "@/components/home/DashboardHome";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Horathai AI — โหราศาสตร์ไทยสุริยยาตร์ ด้วยพลัง AI" },
      {
        name: "description",
        content:
          "ดูดวงโหราศาสตร์ไทยจากตำแหน่งดาวจริง ผังดวง 3 มิติ ดาวย้าย โหร AI และกระเป๋าวันใช้งาน",
      },
      { property: "og:title", content: "Horathai AI — โหราศาสตร์ไทยสุริยยาตร์" },
      {
        property: "og:description",
        content: "ผังดวง 3 มิติ ดาวย้าย โหร AI และวันใช้งานในกระเป๋าส่วนตัว",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardHome,
});
