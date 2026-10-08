import { pageHead } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      path: "/privacy",
      title: "นโยบายความเป็นส่วนตัว | Horathai AI",
      description: "นโยบายการดูแลข้อมูลส่วนบุคคลและข้อมูลดวงกำเนิดของ Horathai AI",
      card: "summary",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12 text-foreground">
      <Link to="/dashboard" className="text-sm text-primary">
        ← กลับสู่แอป
      </Link>
      <h1 className="thai-heading mt-7 text-3xl">นโยบายความเป็นส่วนตัว</h1>
      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          Horathai AI ใช้ข้อมูลบัญชี LINE และข้อมูลวัน เวลา สถานที่เกิด
          เมื่อผู้ใช้เข้าสู่ระบบและยินยอม เพื่อคำนวณดวงและให้บริการเฉพาะบัญชีของผู้ใช้
        </p>
        <p>
          โหมดตรวจสอบเว็บไซต์ใช้ข้อมูลตัวอย่างแบบอ่านอย่างเดียว ไม่สร้างบัญชีผู้ใช้ ไม่บันทึกดวง
          แต้ม การตั้งค่า ประวัติ AI หรือข้อมูลการแจ้งเตือนของผู้เยี่ยมชม
        </p>
        <p>
          ข้อมูลดวงส่วนบุคคลถูกจำกัดการเข้าถึงตามเจ้าของบัญชี
          ผู้ใช้สามารถขอแก้ไขหรือลบข้อมูลได้ผ่านช่องทางติดต่อของบริการ
        </p>
        <p>
          ระบบไม่จำหน่ายข้อมูลส่วนบุคคล และไม่ใช้ข้อมูลดวงเพื่อรับรองผลลัพธ์ด้านสุขภาพ กฎหมาย
          การเงิน หรือเหตุการณ์ชีวิต
        </p>
      </div>
    </main>
  );
}
