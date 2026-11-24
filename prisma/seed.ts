import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Deterministic pseudo-random so screenshots stay stable between seeds
let s = 42;
const rnd = () => {
  s = (s * 1103515245 + 12345) % 2147483648;
  return s / 2147483648;
};

const CHANNELS = ["X", "LINKEDIN", "FACEBOOK", "INSTAGRAM"] as const;

const POST_SAMPLES: { en: string; ar: string }[] = [
  { en: "Launch week: our new analytics dashboard is live. Here is what changed and why it matters for your reporting.", ar: "أسبوع الإطلاق: لوحة التحليلات الجديدة أصبحت متاحة. إليك ما تغير ولماذا يهم تقاريرك." },
  { en: "5 lessons we learned migrating 40 client sites to a headless stack. Thread below.", ar: "٥ دروس تعلمناها من نقل ٤٠ موقع عميل إلى بنية headless. التفاصيل في الثريد." },
  { en: "Case study: how a Cairo clinic cut no-shows by 38% with automated WhatsApp reminders.", ar: "دراسة حالة: كيف قلّصت عيادة في القاهرة نسبة الغياب ٣٨٪ عبر تذكيرات واتساب المؤتمتة." },
  { en: "We are hiring a junior front-end developer. Remote-first, Cairo-friendly hours.", ar: "نوظّف مطوّر واجهات مبتدئ. عمل عن بُعد بدوام يناسب توقيت القاهرة." },
  { en: "Behind the scenes: our design QA checklist before any client launch.", ar: "كواليس: قائمة مراجعة جودة التصميم قبل أي إطلاق لعميل." },
  { en: "New blog post: Core Web Vitals in 2026, what actually moves the needle.", ar: "مقال جديد: مؤشرات Core Web Vitals في ٢٠٢٦ وما الذي يحدث فرقاً فعلاً." },
  { en: "Client win: organic traffic up 212% in 6 months after a technical SEO overhaul.", ar: "نجاح عميل: زيادة الزيارات العضوية ٢١٢٪ خلال ٦ أشهر بعد إصلاح تقني للسيو." },
  { en: "Webinar recap: building multilingual content pipelines that do not break RTL layouts.", ar: "ملخص الندوة: بناء خطوط محتوى متعددة اللغات دون كسر تخطيطات RTL." },
  { en: "Our September content calendar template is now free to download.", ar: "قالب تقويم المحتوى لشهر سبتمبر أصبح متاحاً مجاناً للتحميل." },
  { en: "Hot take: scheduling tools should never auto-publish without human approval. Here is our reasoning.", ar: "رأي صريح: أدوات الجدولة لا يجب أن تنشر تلقائياً دون موافقة بشرية. وهذا منطقنا." },
];

const MEDIA: { file: string; title: string; tags: string }[] = [
  { file: "launch-dashboard.svg", title: "Launch announcement - dashboard", tags: "launch,product" },
  { file: "case-study-clinic.svg", title: "Clinic case study cover", tags: "case-study,health" },
  { file: "hiring-card.svg", title: "Hiring announcement card", tags: "hiring,team" },
  { file: "seo-results.svg", title: "SEO results chart", tags: "seo,results" },
  { file: "webinar-recap.svg", title: "Webinar recap cover", tags: "webinar,event" },
  { file: "template-promo.svg", title: "Free template promo", tags: "template,free" },
  { file: "team-culture.svg", title: "Team culture photo card", tags: "team,culture" },
  { file: "blog-cover-vitals.svg", title: "Blog cover - Web Vitals", tags: "blog,performance" },
  { file: "quote-card.svg", title: "Quote card", tags: "quote,social" },
  { file: "milestone-10k.svg", title: "10k followers milestone", tags: "milestone,social" },
  { file: "product-tip.svg", title: "Product tip card", tags: "product,tip" },
  { file: "event-invite.svg", title: "Event invitation", tags: "event,invite" },
];

async function main() {
  await prisma.approval.deleteMany();
  await prisma.analyticsMetric.deleteMany();
  await prisma.post.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const nada = await prisma.user.create({
    data: { name: "Nada Gamal", email: "nada@contentpilot.demo", role: "OWNER", color: "#8b5cf6" },
  });
  const sarah = await prisma.user.create({
    data: { name: "Sarah Chen", email: "sarah@contentpilot.demo", role: "ADMIN", color: "#0ea5e9" },
  });
  const omar = await prisma.user.create({
    data: { name: "Omar Haddad", email: "omar@contentpilot.demo", role: "MEMBER", color: "#f59e0b" },
  });
  const lina = await prisma.user.create({
    data: { name: "Lina Farouk", email: "lina@contentpilot.demo", role: "CLIENT", color: "#10b981" },
  });

  const ws = await prisma.workspace.create({
    data: { name: "Northwind Digital (demo agency)", plan: "AGENCY" },
  });
  for (const [u, role] of [[nada, "OWNER"], [sarah, "ADMIN"], [omar, "MEMBER"], [lina, "CLIENT"]] as const) {
    await prisma.workspaceMember.create({ data: { userId: u.id, workspaceId: ws.id, role } });
  }

  const brands = await Promise.all([
    prisma.brand.create({ data: { workspaceId: ws.id, name: "Northwind Digital", industry: "Marketing agency", color: "#6366f1" } }),
    prisma.brand.create({ data: { workspaceId: ws.id, name: "Cedar Clinics", industry: "Healthcare", color: "#10b981" } }),
    prisma.brand.create({ data: { workspaceId: ws.id, name: "Atlas Coffee Roasters", industry: "E-commerce / F&B", color: "#f59e0b" } }),
  ]);

  const mediaAssets = [];
  for (const m of MEDIA) {
    mediaAssets.push(
      await prisma.mediaAsset.create({
        data: { workspaceId: ws.id, title: m.title, path: `/media/${m.file}`, tags: m.tags },
      })
    );
  }

  const now = new Date();
  const statuses = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "SCHEDULED", "PUBLISHED"] as const;
  const posts = [];
  for (let i = 0; i < 32; i++) {
    const sample = POST_SAMPLES[i % POST_SAMPLES.length];
    const brand = brands[i % brands.length];
    const author = [nada, sarah, omar][i % 3];
    const dayOffset = Math.floor(rnd() * 50) - 25; // -25 .. +24 days
    const scheduledAt = new Date(now.getTime() + dayOffset * 86400000 + Math.floor(rnd() * 10 + 8) * 3600000);
    let status: string;
    if (dayOffset < -1) status = rnd() < 0.9 ? "PUBLISHED" : "REJECTED";
    else if (i % 7 === 0) status = "DRAFT";
    else if (i % 5 === 0) status = "PENDING_APPROVAL";
    else if (i % 3 === 0) status = "APPROVED";
    else status = "SCHEDULED";
    const chans = CHANNELS.filter(() => rnd() < 0.55);
    if (chans.length === 0) chans.push("LINKEDIN");
    const post = await prisma.post.create({
      data: {
        brandId: brand.id,
        authorId: author.id,
        content: sample.en,
        contentAr: sample.ar,
        status,
        channels: chans.join(","),
        mediaId: rnd() < 0.6 ? mediaAssets[i % mediaAssets.length].id : null,
        scheduledAt: status === "DRAFT" ? null : scheduledAt,
        publishedAt: status === "PUBLISHED" ? scheduledAt : null,
      },
    });
    posts.push(post);
    if (status === "APPROVED" || status === "SCHEDULED" || status === "PUBLISHED") {
      await prisma.approval.create({
        data: {
          postId: post.id,
          reviewerId: rnd() < 0.5 ? nada.id : sarah.id,
          decision: "APPROVED",
          note: rnd() < 0.4 ? "Looks good, ship it." : null,
          createdAt: new Date(scheduledAt.getTime() - 86400000),
        },
      });
    } else if (status === "REJECTED") {
      await prisma.approval.create({
        data: { postId: post.id, reviewerId: nada.id, decision: "REJECTED", note: "Tone is off for this brand, rework please." },
      });
    }
  }

  // 90 days of analytics per brand x channel
  for (const brand of brands) {
    for (const ch of CHANNELS) {
      let followers = 2000 + Math.floor(rnd() * 8000);
      for (let d = 90; d >= 0; d--) {
        const date = new Date(now.getTime() - d * 86400000);
        const base = 800 + rnd() * 4200;
        const weekend = [5, 6].includes(date.getDay()) ? 0.7 : 1;
        followers += Math.floor(rnd() * 40) - 8;
        await prisma.analyticsMetric.create({
          data: {
            brandId: brand.id,
            channel: ch,
            date,
            impressions: Math.floor(base * weekend),
            engagements: Math.floor(base * weekend * (0.03 + rnd() * 0.06)),
            clicks: Math.floor(base * weekend * (0.01 + rnd() * 0.03)),
            followers: Math.max(followers, 500),
          },
        });
      }
    }
  }

  console.log("Seeded:", {
    users: 4,
    brands: brands.length,
    posts: posts.length,
    media: mediaAssets.length,
  });
}

main().finally(() => prisma.$disconnect());
