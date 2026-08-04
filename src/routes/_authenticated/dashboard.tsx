import { createFileRoute } from "@tanstack/react-router";

import { DashboardHome } from "@/components/home/DashboardHome";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Horathai AI — โหราศาสตร์ไทยสุริยยาตร์ ด้วยพลัง AI" },
      {
        name: "description",
        content:
          "ดูดวงโหราศาสตร์ไทยแม่นยำจากตำแหน่งดาวจริง ผังดวง 3 มิติ ดาวย้าย และโหร AI ส่วนตัว ทดลองพรีเมียมฟรี 30 วัน",
      },
      { property: "og:title", content: "Horathai AI — โหราศาสตร์ไทยสุริยยาตร์" },
      {
        property: "og:description",
        content: "ผังดวง 3 มิติ ดาวย้าย และโหร AI ส่วนตัว สำหรับคนไทย ทดลองฟรี 30 วัน",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardHome,
});

