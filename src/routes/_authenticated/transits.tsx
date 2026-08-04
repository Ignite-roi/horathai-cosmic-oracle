import { createFileRoute } from "@tanstack/react-router";

import { TransitExperience } from "@/components/transit/TransitExperience";

export const Route = createFileRoute("/_authenticated/transits")({
  head: () => ({
    meta: [
      { title: "ดาวย้าย & ท่องเวลา | Horathai AI" },
      {
        name: "description",
        content:
          "เลื่อนไทม์ไลน์เพื่อเทียบตำแหน่งดาวจรในอดีตและอนาคต พร้อมผลต่อภพและคะแนนการงาน เงิน ความรัก สุขภาพ",
      },
      { property: "og:title", content: "ดาวย้าย & ท่องเวลา | Horathai AI" },
      {
        property: "og:description",
        content: "Time Travel Slider เทียบตำแหน่งดาวตามวันที่เลือก ด้วยเครื่องคำนวณนิรายนะ",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransitExperience,
});

