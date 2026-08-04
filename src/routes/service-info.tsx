import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/service-info")({
  head: () => ({ meta: [
    { title: "ข้อมูลบริการและติดต่อ | Horathai AI" },
    { name: "description", content: "รายละเอียดบริการ แพ็กเกจ และสถานะช่องทางชำระเงินของ Horathai AI" },
    { property: "og:title", content: "ข้อมูลบริการและติดต่อ | Horathai AI" },
    { property: "og:description", content: "ข้อมูลสำหรับผู้ใช้และผู้ตรวจสอบบริการ Horathai AI" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ServiceInfoPage,
});

function ServiceInfoPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12 text-foreground">
      <Link to="/" className="text-sm text-primary">← หน้าแรก</Link>
      <h1 className="thai-heading mt-7 text-3xl">ข้อมูลสินค้าและบริการ</h1>
      <div className="mt-6 space-y-6 text-sm leading-7 text-muted-foreground">
        <section><h2 className="thai-heading text-xl text-foreground">ผู้ให้บริการ</h2><p className="mt-2">Horathai AI เป็นบริการดิจิทัลด้านการคำนวณผังดวง โหราศาสตร์เชิงสะท้อนตนเอง ดาวจร ปฏิทิน และผู้ช่วย AI โดยผลลัพธ์ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์หรือคำแนะนำวิชาชีพ</p></section>
        <section><h2 className="thai-heading text-xl text-foreground">รูปแบบสินค้า</h2><p className="mt-2">แพ็กเกจเป็นสิทธิ์ใช้งานบริการดิจิทัลตามจำนวนวันที่ระบุ ไม่มีการจัดส่งสินค้าทางกายภาพ ราคาและจำนวนวันแสดงที่หน้า <Link to="/wallet" className="text-primary">กระเป๋าวันใช้งาน</Link></p></section>
        <section><h2 className="thai-heading text-xl text-foreground">สถานะการชำระเงิน</h2><p className="mt-2">เว็บไซต์รอบตรวจนี้ยังไม่เชื่อม Payment Gateway และไม่รับหรือตัดเงินจริง ปุ่มเพิ่มวันสำหรับผู้เยี่ยมชมถูกปิด และไม่มีการเพิ่มวันหรือแต้มจากโหมด Guest</p></section>
        <section><h2 className="thai-heading text-xl text-foreground">ช่องทางติดต่อ</h2><p className="mt-2">ช่องทางบริการลูกค้าอย่างเป็นทางการอยู่ระหว่างการยืนยันก่อนเปิดรับชำระเงินจริง เจ้าของบริการต้องประกาศช่องทางติดต่อที่ตรวจสอบได้ในหน้านี้ก่อนเปิดขาย</p></section>
        <p><Link to="/terms" className="text-primary">ข้อกำหนดและการคืนเงิน</Link> · <Link to="/privacy" className="text-primary">นโยบายความเป็นส่วนตัว</Link></p>
      </div>
    </main>
  );
}