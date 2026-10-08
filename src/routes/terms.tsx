import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "ข้อกำหนดการใช้งาน | Horathai AI" },
      { name: "description", content: "ข้อกำหนดการใช้บริการโหราศาสตร์ไทย Horathai AI" },
      { property: "og:title", content: "ข้อกำหนดการใช้งาน | Horathai AI" },
      { property: "og:description", content: "เงื่อนไขและข้อจำกัดของบริการ Horathai AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12 text-foreground">
      <Link to="/dashboard" className="text-sm text-primary">
        ← กลับสู่แอป
      </Link>
      <h1 className="thai-heading mt-7 text-3xl">ข้อกำหนดการใช้งาน</h1>
      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          Horathai AI นำเสนอข้อมูลโหราศาสตร์ไทยเพื่อการสะท้อนตนเองและความบันเทิง
          ไม่ใช่หลักฐานทางวิทยาศาสตร์หรือคำรับรองเหตุการณ์ในชีวิต
        </p>
        <p>
          ผลคำนวณขึ้นกับวัน เวลา สถานที่เกิด และโปรไฟล์การคำนวณที่ระบุ หากเวลาเกิดไม่แน่นอน
          ลัคนาและเรือนอาจเปลี่ยนแปลงได้
        </p>
        <p>
          ห้ามใช้บริการแทนคำแนะนำจากผู้เชี่ยวชาญด้านการแพทย์ กฎหมาย การเงิน หรือความปลอดภัย
          และผู้ใช้ต้องรับผิดชอบการตัดสินใจของตนเอง
        </p>
        <p>
          แพ็กเกจและการชำระเงินที่แสดงในช่วงตรวจสอบยังไม่เปิดจำหน่าย
          จนกว่าจะมีการประกาศว่าระบบชำระเงินเชื่อมต่อสมบูรณ์
        </p>
        <section>
          <h2 className="thai-heading text-xl text-foreground">การยกเลิกและคืนเงิน</h2>
          <p className="mt-2">
            ขณะนี้ยังไม่มีการรับชำระเงินจริง จึงยังไม่มีรายการให้ยกเลิกหรือคืนเงิน
            ก่อนเปิดขาย ระบบจะประกาศวิธีขอยกเลิก ระยะเวลาดำเนินการ และเงื่อนไขคืนเงินอย่างชัดเจนในหน้านี้
          </p>
        </section>
        <p><Link to="/service-info" className="text-primary">ดูรายละเอียดสินค้า บริการ และช่องทางติดต่อ</Link></p>
      </div>
    </main>
  );
}
