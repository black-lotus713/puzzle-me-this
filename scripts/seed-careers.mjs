// Seed script for Puzzle #136 — Careers & Applicant Manager
// Inserts job listings, generates PDF CVs, uploads them to the
// applicant-cvs bucket, and inserts applications referencing them.
// Run with: node scripts/seed-careers.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const env = Object.fromEntries(
  readFileSync(resolve(root, '.env'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

// ── Minimal PDF generator ──────────────────────────────────
// Builds a valid single-page PDF with Helvetica text lines.

function escapePdfText(s) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function makePdf(lines) {
  // lines: [{ text, size, bold, gap }]
  let content = ''
  let y = 740
  for (const line of lines) {
    const size = line.size ?? 11
    y -= line.gap ?? size + 7
    const font = line.bold ? '/F2' : '/F1'
    content += `BT ${font} ${size} Tf 72 ${y} Td (${escapePdfText(line.text)}) Tj ET\n`
  }

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = []
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf))
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })
  const xrefStart = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  return Buffer.from(pdf, 'latin1')
}

function cvPdf(a) {
  const lines = [
    { text: a.full_name, size: 20, bold: true, gap: 30 },
    { text: a.headline, size: 12, gap: 22 },
    { text: `${a.email}  ·  ${a.phone || 'phone on request'}  ·  ${a.city}`, size: 10, gap: 18 },
    { text: ' ', size: 6 },
    { text: 'SUMMARY', size: 12, bold: true, gap: 26 },
    ...a.summary.map((t) => ({ text: t, size: 10 })),
    { text: ' ', size: 6 },
    { text: 'EXPERIENCE', size: 12, bold: true, gap: 26 },
    ...a.experience.map((t) => ({ text: t, size: 10 })),
    { text: ' ', size: 6 },
    { text: 'SKILLS', size: 12, bold: true, gap: 26 },
    { text: a.skills, size: 10 },
  ]
  return makePdf(lines)
}

// ── Stock data ─────────────────────────────────────────────

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()

const jobs = [
  {
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'Remote (US)',
    employment_type: 'full-time',
    salary_range: '$95k–$125k',
    description:
      'Lead the design of our handcrafted home goods line from concept through production. You will partner with our artisans and merchandising team to shape collections that feel warm, functional, and built to last.',
    requirements:
      '5+ years of product or industrial design experience\nA portfolio showing physical product work, ideally home goods\nComfort working directly with makers and production constraints\nProficiency in CAD and rapid prototyping workflows',
    status: 'open',
    created_at: daysAgo(12),
  },
  {
    title: 'Ceramics Production Artisan',
    department: 'Production',
    location: 'Asheville, NC',
    employment_type: 'full-time',
    salary_range: '$52k–$64k',
    description:
      'Join our studio team throwing, glazing, and finishing small-batch ceramic pieces. You will own quality from wedging to kiln unload and help refine our production processes as we scale.',
    requirements:
      '3+ years of wheel-throwing experience in a production setting\nStrong glaze chemistry fundamentals\nAbility to lift 50 lbs and stand for extended periods\nAttention to consistency across batches',
    status: 'open',
    created_at: daysAgo(9),
  },
  {
    title: 'E-commerce Marketing Manager',
    department: 'Marketing',
    location: 'Remote (US)',
    employment_type: 'full-time',
    salary_range: '$80k–$100k',
    description:
      'Own our online growth: email, paid social, SEO, and lifecycle campaigns. You will tell the story of small-batch craftsmanship to a national audience and turn browsers into repeat customers.',
    requirements:
      '4+ years in DTC e-commerce marketing\nHands-on experience with Klaviyo or similar ESP\nStrong analytical skills — you live in conversion funnels\nExperience marketing physical products preferred',
    status: 'open',
    created_at: daysAgo(7),
  },
  {
    title: 'Customer Experience Specialist',
    department: 'Support',
    location: 'Remote (US)',
    employment_type: 'part-time',
    salary_range: '$24–$28/hr',
    description:
      'Be the friendly first contact for our customers across email and chat. Help with orders, returns, and care questions, and feed what you hear back into how we make and sell our goods.',
    requirements:
      '2+ years in customer support, retail, or hospitality\nWarm, clear written communication\nComfort with Shopify and helpdesk tooling\nAvailability for at least 20 hours per week',
    status: 'open',
    created_at: daysAgo(5),
  },
  {
    title: 'Supply Chain Coordinator',
    department: 'Operations',
    location: 'Asheville, NC',
    employment_type: 'full-time',
    salary_range: '$60k–$75k',
    description:
      'Keep raw materials flowing and finished goods moving. You will manage vendor relationships, track inventory across our studio and 3PL, and smooth out the bumps between making and shipping.',
    requirements:
      '2+ years in supply chain, logistics, or inventory operations\nSpreadsheet fluency and ERP familiarity\nVendor negotiation experience\nCalm under shifting priorities',
    status: 'draft',
    created_at: daysAgo(2),
  },
  {
    title: 'Holiday Retail Associate',
    department: 'Retail',
    location: 'Asheville, NC',
    employment_type: 'contract',
    salary_range: null,
    description:
      'Seasonal role supporting our studio storefront through the holiday rush: helping customers, wrapping gifts, restocking shelves, and keeping the shop feeling welcoming.',
    requirements:
      'Retail or customer-facing experience\nWeekend availability November through January\nEnthusiasm for handmade goods',
    status: 'closed',
    created_at: daysAgo(45),
  },
]

// jobKey → index into jobs array (matched after insert)
const applicants = [
  {
    jobKey: 'Senior Product Designer',
    full_name: 'Maya Okonkwo',
    email: 'maya.okonkwo@example.com',
    phone: '+1 415 555 0132',
    city: 'Oakland, CA',
    headline: 'Senior Industrial Designer — Home & Lifestyle',
    status: 'shortlisted',
    days_ago: 10,
    cover_note:
      "I've spent the last six years designing tabletop and kitchen goods for small-batch makers, and your collection's balance of warmth and utility is exactly the design language I love working in. I'd bring both CAD rigor and real studio empathy to the team.",
    summary: [
      'Industrial designer with 8 years across home goods and lifestyle brands.',
      'Shipped 40+ SKUs from sketch to shelf with artisan production partners.',
    ],
    experience: [
      'Senior Designer, Hearthline Goods (2021–present) — led tabletop collection, +32% category revenue',
      'Product Designer, Foundry Collective (2018–2021) — kitchenware line across 3 material families',
    ],
    skills: 'Rhino, SolidWorks, KeyShot, prototyping, DFM, materials research',
  },
  {
    jobKey: 'Senior Product Designer',
    full_name: 'Daniel Reyes',
    email: 'dreyes.design@example.com',
    phone: '+1 312 555 0177',
    city: 'Chicago, IL',
    headline: 'Product Designer — Furniture & Objects',
    status: 'reviewed',
    days_ago: 8,
    cover_note:
      'My background is in furniture, but the craft sensibility carries straight into smaller goods. Portfolio link is on my CV.',
    summary: [
      'Furniture-trained product designer moving into home accessories.',
      '6 years of experience, strong woodworking and joinery background.',
    ],
    experience: [
      'Designer, Meridian Furniture Co. (2019–present) — case goods and occasional tables',
      'Junior Designer, Studio Arbor (2017–2019) — custom residential pieces',
    ],
    skills: 'SolidWorks, AutoCAD, woodshop fabrication, finish specification',
  },
  {
    jobKey: 'Senior Product Designer',
    full_name: 'Priya Raghavan',
    email: 'priya.raghavan@example.com',
    phone: '',
    city: 'Austin, TX',
    headline: 'UX Designer transitioning to physical product',
    status: 'rejected',
    days_ago: 11,
    cover_note: 'Most of my experience is digital, but I am eager to move into physical product design.',
    summary: [
      'Senior UX designer with 7 years in consumer apps.',
      'Hobbyist ceramicist seeking a move into physical product.',
    ],
    experience: [
      'Senior UX Designer, Finch Labs (2020–present) — consumer fintech app',
      'UX Designer, Brightside (2017–2020) — onboarding and growth flows',
    ],
    skills: 'Figma, user research, prototyping, hand-building ceramics',
  },
  {
    jobKey: 'Ceramics Production Artisan',
    full_name: 'Tomás Herrera',
    email: 'tomas.herrera@example.com',
    phone: '+1 828 555 0119',
    city: 'Asheville, NC',
    headline: 'Production Potter — 9 years at the wheel',
    status: 'shortlisted',
    days_ago: 6,
    cover_note:
      "I throw 60–80 consistent forms a day at my current studio and manage our cone 6 glaze program. I'm local to Asheville and could start within two weeks.",
    summary: [
      'Production potter specializing in high-volume consistent throwing.',
      'Deep cone 6 oxidation glaze experience; kiln maintenance certified.',
    ],
    experience: [
      'Lead Potter, Blue Ridge Clayworks (2019–present) — production line of 25 forms',
      'Studio Potter, Riverbend Ceramics (2016–2019) — throwing and glazing',
    ],
    skills: 'Wheel throwing, glaze chemistry, kiln firing, slip casting, QC',
  },
  {
    jobKey: 'Ceramics Production Artisan',
    full_name: 'Anna Lindqvist',
    email: 'anna.lindqvist@example.com',
    phone: '+1 828 555 0163',
    city: 'Weaverville, NC',
    headline: 'Ceramic Artist & Studio Technician',
    status: 'new',
    days_ago: 1,
    cover_note:
      'I run a small studio practice and have spent two seasons as a studio tech at Penland. Excited about production work with a brand whose forms I already admire.',
    summary: [
      'Ceramic artist with studio technician experience at Penland School of Craft.',
      'Comfortable across throwing, trimming, glazing, and firing schedules.',
    ],
    experience: [
      'Studio Technician, Penland School of Craft (2023–present, seasonal)',
      'Independent Studio Practice (2020–present) — wholesale to 12 shops',
    ],
    skills: 'Throwing, glaze mixing, electric and gas firing, studio maintenance',
  },
  {
    jobKey: 'E-commerce Marketing Manager',
    full_name: 'Jordan Whitfield',
    email: 'jordan.whitfield@example.com',
    phone: '+1 646 555 0142',
    city: 'Brooklyn, NY',
    headline: 'DTC Growth Marketer — Home & Lifestyle Brands',
    status: 'new',
    days_ago: 2,
    cover_note:
      'I grew a ceramics DTC brand from $800k to $3.2M over three years with email and paid social doing the heavy lifting. Happy to walk through the playbook.',
    summary: [
      'DTC growth marketer with 6 years in home and lifestyle e-commerce.',
      'Klaviyo power user; managed $1.5M annual paid budget.',
    ],
    experience: [
      'Growth Lead, Kiln & Co. (2021–present) — 4x revenue in 3 years',
      'Marketing Manager, Nest Modern (2018–2021) — email program from scratch',
    ],
    skills: 'Klaviyo, Meta Ads, Google Ads, GA4, Shopify, SEO, CRO',
  },
  {
    jobKey: 'E-commerce Marketing Manager',
    full_name: 'Sofia Marchetti',
    email: 'sofia.marchetti@example.com',
    phone: '+1 415 555 0188',
    city: 'San Francisco, CA',
    headline: 'Lifecycle Marketing Manager',
    status: 'reviewed',
    days_ago: 4,
    cover_note:
      'Lifecycle and retention are my specialty — my current program drives 41% of revenue from email and SMS.',
    summary: [
      'Lifecycle marketer focused on retention and repeat purchase.',
      '5 years in DTC; strong segmentation and A/B testing practice.',
    ],
    experience: [
      'Lifecycle Manager, Verdant Home (2022–present) — email/SMS = 41% of revenue',
      'CRM Specialist, Bloomstead (2019–2022) — built loyalty program',
    ],
    skills: 'Klaviyo, Attentive, segmentation, A/B testing, retention analytics',
  },
  {
    jobKey: 'E-commerce Marketing Manager',
    full_name: 'Marcus Webb',
    email: 'marcus.webb@example.com',
    phone: '',
    city: 'Denver, CO',
    headline: 'Digital Marketing Generalist',
    status: 'new',
    days_ago: 1,
    cover_note: '',
    summary: [
      'Digital marketing generalist with agency and in-house experience.',
      '4 years across paid, organic social, and content.',
    ],
    experience: [
      'Marketing Specialist, Alpine Agency (2022–present) — 8 DTC client accounts',
      'Coordinator, Summit Outdoors (2020–2022) — social and content calendar',
    ],
    skills: 'Meta Ads, TikTok Ads, content strategy, Canva, basic SQL',
  },
  {
    jobKey: 'Customer Experience Specialist',
    full_name: 'Grace Nakamura',
    email: 'grace.nakamura@example.com',
    phone: '+1 503 555 0151',
    city: 'Portland, OR',
    headline: 'Customer Experience — DTC Retail',
    status: 'new',
    days_ago: 0,
    cover_note:
      "I've handled support for a pottery subscription box for two years — care questions, breakage claims, the lot. Your products would be easy to champion.",
    summary: [
      'CX specialist with 4 years in DTC home goods support.',
      'Maintains 98% CSAT across email and chat.',
    ],
    experience: [
      'CX Specialist, Glaze Box (2022–present) — email/chat, returns, claims',
      'Retail Associate, Made Local PDX (2020–2022) — floor sales and gifting',
    ],
    skills: 'Gorgias, Zendesk, Shopify admin, conflict resolution, copywriting',
  },
  {
    jobKey: 'Customer Experience Specialist',
    full_name: "Liam O'Donnell",
    email: 'liam.odonnell@example.com',
    phone: '+1 617 555 0125',
    city: 'Boston, MA',
    headline: 'Hospitality Professional moving to remote CX',
    status: 'reviewed',
    days_ago: 3,
    cover_note:
      'Eight years in hospitality taught me how to make people feel taken care of. Looking to bring that to a remote support role with a product I believe in.',
    summary: [
      'Hospitality veteran (8 years) transitioning to remote customer experience.',
      'Calm, warm communicator with high-volume front-desk experience.',
    ],
    experience: [
      'Front Office Manager, The Beacon Hotel (2021–present) — team of 6',
      'Guest Services, Harborview Inn (2017–2021)',
    ],
    skills: 'Guest relations, de-escalation, OpenTable, basic Shopify, scheduling',
  },
]

// ── Seed ───────────────────────────────────────────────────

async function main() {
  console.log('Inserting job listings…')
  const { data: insertedJobs, error: jobErr } = await supabase
    .from('job_listings')
    .insert(jobs)
    .select('id, title')
  if (jobErr) throw jobErr
  const jobIdByTitle = Object.fromEntries(insertedJobs.map((j) => [j.title, j.id]))
  console.log(`  ${insertedJobs.length} jobs inserted.`)

  console.log('Uploading CVs and inserting applications…')
  for (const a of applicants) {
    const pdf = cvPdf(a)
    const filename = `${Date.now()}-${a.full_name.toLowerCase().replace(/[^a-z]+/g, '-')}-cv.pdf`
    const { error: upErr } = await supabase.storage
      .from('applicant-cvs')
      .upload(filename, pdf, { contentType: 'application/pdf' })
    if (upErr) throw upErr
    const { data: pub } = supabase.storage.from('applicant-cvs').getPublicUrl(filename)

    const { error: appErr } = await supabase.from('job_applications').insert({
      job_id: jobIdByTitle[a.jobKey],
      full_name: a.full_name,
      email: a.email,
      phone: a.phone || null,
      cover_note: a.cover_note || null,
      cv_url: pub.publicUrl,
      status: a.status,
      created_at: daysAgo(a.days_ago),
    })
    if (appErr) throw appErr
    console.log(`  ${a.full_name} → ${a.jobKey} [${a.status}]`)
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error('Seed failed:', e.message ?? e)
  process.exit(1)
})
