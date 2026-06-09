/**
 * Seed FAQ documents into Sanity.
 *
 * The FAQ page (src/pages/faq.astro) is CMS-driven and renders FAQPage JSON-LD
 * from `_type == "faq"` documents, but very few FAQ docs currently exist. This
 * script seeds the well-written legacy Q&As (transcribed verbatim from the
 * `_oldFaqCategories` array in faq.astro) plus several new local SEO Q&As.
 *
 * Idempotent: each FAQ gets a deterministic, stable `_id` derived from its
 * question, and `client.createIfNotExists` is used so re-runs are safe.
 *
 * Usage:
 *   node scripts/seed-faqs.js [--dry-run]
 *
 * Requires in .env:
 *   PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_API_TOKEN
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const dryRun = process.argv.includes('--dry-run');

// Verified contact values (real values from src/lib/config.ts CONTACT).
const PHONE = '(414) 332-8888';
const EMAIL = 'info@holisticacupuncture.net';

// FAQ content. Categories use the canonical value keys from
// src/types/sanity.ts faqCategories:
//   about-acupuncture, treatment-process, insurance-payment,
//   appointments-policies, safety-side-effects, our-practice
const FAQS = [
  // --- About Acupuncture (legacy) ---
  {
    category: 'about-acupuncture',
    question: 'What is acupuncture?',
    answer:
      "Acupuncture is a 3,000-year-old healing technique from Traditional Chinese Medicine. It involves inserting very thin needles at specific points on the body to stimulate the body's natural healing abilities, restore balance, and promote overall wellness.",
  },
  {
    category: 'about-acupuncture',
    question: 'How does acupuncture work?',
    answer:
      "From a traditional perspective, acupuncture balances the flow of energy (Qi) through pathways called meridians. From a modern scientific view, acupuncture stimulates nerves, muscles, and connective tissue, which boosts your body's natural painkillers and increases blood flow.",
  },
  {
    category: 'about-acupuncture',
    question: 'Is acupuncture scientifically proven?',
    answer:
      'Yes! Numerous research studies have demonstrated acupuncture\'s effectiveness for various conditions. The National Institutes of Health (NIH) and the World Health Organization (WHO) recognize acupuncture as a valid treatment for over 40 medical conditions, including chronic pain, headaches, anxiety, and digestive issues.',
  },
  {
    category: 'about-acupuncture',
    question: 'What conditions can acupuncture treat?',
    answer:
      "Acupuncture effectively treats a wide range of conditions including chronic pain, headaches and migraines, stress and anxiety, insomnia, digestive issues, allergies, women's health concerns (PMS, menopause, fertility), and more. Visit our Conditions page for a complete list.",
  },

  // --- Treatment & Process (legacy) ---
  {
    category: 'treatment-process',
    question: 'Does acupuncture hurt?',
    answer:
      'Most people feel minimal to no pain. Acupuncture needles are hair-thin—much finer than needles used for injections or blood draws. You may feel a slight pinch or tingling sensation as the needle is inserted, followed by a dull ache or warm sensation. Many patients find the treatment deeply relaxing.',
  },
  {
    category: 'treatment-process',
    question: 'What should I expect during my first visit?',
    answer:
      "Your first visit typically lasts 60-90 minutes. We'll discuss your health history, current symptoms, lifestyle, and treatment goals. After a thorough consultation, we'll perform your first acupuncture treatment, which usually lasts 20-30 minutes. Plan to wear comfortable, loose-fitting clothing.",
  },
  {
    category: 'treatment-process',
    question: 'How long does each treatment take?',
    answer:
      'Initial consultations last 60-90 minutes. Follow-up treatments typically take 45-60 minutes, including consultation time. The needles usually stay in place for 20-30 minutes while you rest comfortably.',
  },
  {
    category: 'treatment-process',
    question: 'How many treatments will I need?',
    answer:
      "This varies depending on your condition. Acute issues may resolve in 3-5 sessions, while chronic conditions often require 8-12 sessions or more. Many patients notice improvements after just a few treatments. We'll create a personalized treatment plan and adjust it based on your progress.",
  },
  {
    category: 'treatment-process',
    question: 'How often should I come for treatments?',
    answer:
      "For chronic conditions, we typically recommend weekly sessions for the first 6-8 weeks. As you improve, we'll space treatments to bi-weekly or monthly maintenance sessions. Acute conditions may require more frequent initial visits.",
  },
  {
    category: 'treatment-process',
    question: 'What should I do before my appointment?',
    answer:
      "Eat a light meal 1-2 hours before your appointment (don't come on an empty stomach). Wear loose, comfortable clothing that allows easy access to your arms and legs. Avoid caffeine and alcohol for a few hours before treatment. Arrive with an open mind and ready to relax!",
  },
  {
    category: 'treatment-process',
    question: 'What should I do after treatment?',
    answer:
      'Drink plenty of water, avoid strenuous exercise for the rest of the day, and give yourself time to rest. Some people feel energized after treatment while others feel relaxed and sleepy—both are normal. Avoid alcohol for 24 hours to maximize the treatment benefits.',
  },

  // --- Insurance & Payment (legacy) ---
  {
    category: 'insurance-payment',
    question: 'Do you accept insurance?',
    answer:
      'Yes! We are in-network with several major insurance providers including Blue Cross Blue Shield, United Healthcare, Cigna, and Aetna. We can also provide superbills for out-of-network reimbursement. Contact us to verify your specific coverage.',
  },
  {
    category: 'insurance-payment',
    question: 'How much does treatment cost?',
    answer:
      'Initial consultations are $150-$175, and follow-up treatments range from $85-$120 depending on the services provided. Many insurance plans cover acupuncture, which can significantly reduce your out-of-pocket costs. We also offer package deals for multiple sessions paid in advance.',
  },
  {
    category: 'insurance-payment',
    question: 'Will my insurance cover acupuncture?',
    answer:
      "Many insurance plans now cover acupuncture, especially for pain management. Coverage varies by plan, so we recommend calling your insurance company to verify your benefits. We're happy to help you understand your coverage and submit claims on your behalf.",
  },
  {
    category: 'insurance-payment',
    question: 'Do you offer payment plans?',
    answer:
      'Yes, we offer package deals where you can prepay for multiple sessions at a discounted rate. We also accept HSA and FSA cards. For patients with financial hardship, please speak with our office manager about payment arrangements.',
  },
  {
    category: 'insurance-payment',
    question: 'What forms of payment do you accept?',
    answer:
      'We accept cash, checks, and all major credit cards (Visa, MasterCard, American Express, Discover). We also accept HSA and FSA cards. Payment is due at the time of service.',
  },

  // --- Appointments & Policies (legacy) ---
  {
    category: 'appointments-policies',
    question: 'How do I schedule an appointment?',
    // Legacy answer used template literals ${CONTACT.phone} / ${CONTACT.email};
    // hardcoded here to the real verified values.
    answer:
      `You can schedule by phone at ${PHONE}, email us at ${EMAIL}, or use our online booking system. We typically have same-week availability and offer early morning and evening appointments for your convenience.`,
  },
  {
    category: 'appointments-policies',
    question: 'What is your cancellation policy?',
    answer:
      "We require 24 hours' notice for cancellations or rescheduling. Late cancellations (less than 24 hours' notice) may be charged 50% of the session fee. No-shows will be charged the full session fee. We understand emergencies happen—please call us to discuss your situation.",
  },
  {
    category: 'appointments-policies',
    question: 'Do you offer evening or weekend appointments?',
    answer:
      "Yes! We offer appointments Monday through Thursday from 9:00 AM - 7:00 PM. Friday is an administrative day. We're closed on Saturdays and Sundays. Evening appointments fill up quickly, so we recommend booking in advance.",
  },
  {
    category: 'appointments-policies',
    question: 'Can I bring a friend or family member to my appointment?',
    answer:
      "For your first visit, you're welcome to bring someone for support during the consultation. However, during the treatment itself, we recommend coming alone to maximize relaxation and therapeutic benefits. Parents/guardians must accompany minors.",
  },

  // --- Safety & Side Effects (legacy) ---
  {
    category: 'safety-side-effects',
    question: 'Is acupuncture safe?',
    answer:
      'Yes, acupuncture is extremely safe when performed by licensed, trained practitioners. We use sterile, single-use, disposable needles and follow strict safety protocols. Serious side effects are extremely rare—much rarer than complications from medications or surgery.',
  },
  {
    category: 'safety-side-effects',
    question: 'Are there any side effects?',
    answer:
      'Most people experience no side effects. Occasionally, patients may have minor bruising or soreness at needle sites, temporary fatigue, or mild lightheadedness. These effects are typically short-lived. Some people experience an initial worsening of symptoms before improvement—this is a positive sign that your body is responding.',
  },
  {
    category: 'safety-side-effects',
    question: 'Are your needles sterile?',
    answer:
      'Absolutely. We only use FDA-approved, sterile, single-use, disposable needles. Each needle is individually packaged and discarded immediately after use. We maintain the highest standards of cleanliness and safety.',
  },
  {
    category: 'safety-side-effects',
    question: "Can I get acupuncture if I'm pregnant?",
    answer:
      'Yes! Acupuncture is safe during pregnancy and can help with nausea, back pain, anxiety, and preparation for labor. However, certain acupuncture points are avoided during pregnancy. Always inform us if you are or might be pregnant.',
  },
  {
    category: 'safety-side-effects',
    question: 'Can children receive acupuncture?',
    answer:
      'Yes, children can safely receive acupuncture. We use gentler techniques, fewer needles, and shorter treatment times for pediatric patients. Parental consent and presence is required for patients under 18.',
  },
  {
    category: 'safety-side-effects',
    question: "Are there any situations where acupuncture isn't recommended?",
    answer:
      "Acupuncture is safe for most people, but we'll discuss your full medical history during your consultation. Inform us if you have a pacemaker, bleeding disorders, are on blood thinners, have metal allergies, or have active infections. We may need to modify treatment or obtain clearance from your physician in certain cases.",
  },

  // --- Our Practice (legacy) ---
  {
    category: 'our-practice',
    question: "What are your practitioners' qualifications?",
    answer:
      'All our practitioners are licensed acupuncturists (L.Ac.) with extensive training in Traditional Chinese Medicine. Our lead practitioner, Dr. David Curry, has over 25 years of experience and holds certifications from the National Certification Commission for Acupuncture and Oriental Medicine (NCCAOM).',
  },
  {
    category: 'our-practice',
    question: 'Where are you located?',
    answer:
      "We're conveniently located at 500 W Silver Spring Dr. Ste K205, Glendale, WI 53217. We offer free parking and are easily accessible from Milwaukee and the North Shore suburbs.",
  },
  {
    category: 'our-practice',
    question: 'Do you offer virtual consultations?',
    answer:
      'While acupuncture requires in-person treatment, we do offer virtual consultations for initial assessments, follow-up discussions, lifestyle counseling, and herbal medicine consultations. Contact us to schedule a virtual appointment.',
  },
  {
    category: 'our-practice',
    question: 'Can you work with my other healthcare providers?',
    answer:
      'Absolutely! We believe in integrative care and are happy to communicate with your physicians, chiropractors, physical therapists, or other healthcare providers (with your written consent). Acupuncture complements conventional medical treatment beautifully.',
  },
  {
    category: 'our-practice',
    question: 'What makes your practice different?',
    answer:
      'We combine 25+ years of experience with a commitment to individualized, compassionate care. We take time to truly listen to your concerns, create personalized treatment plans, and support your entire wellness journey. Our patients often comment on our peaceful office environment and the genuine care they receive.',
  },

  // --- NEW local SEO Q&As ---
  {
    category: 'our-practice',
    question: 'Is there an acupuncture clinic near Shorewood or Whitefish Bay?',
    answer:
      'Yes. Our clinic is located in Glendale at 500 W Silver Spring Dr. Ste K205, Glendale, WI 53217, just minutes from both Shorewood and Whitefish Bay. We proudly serve patients throughout Milwaukee\'s North Shore, including Shorewood, Whitefish Bay, Fox Point, Bayside, and Brown Deer. Our central location makes it easy to fit acupuncture into your routine, whether you\'re coming from home or work. We offer free on-site parking and a calm, welcoming treatment environment. If you\'ve been searching for a licensed acupuncturist close to the North Shore, we\'re a short drive away and happy to answer any questions about getting started.',
  },
  {
    category: 'insurance-payment',
    question: 'How much does acupuncture cost in Milwaukee?',
    answer:
      'At our Glendale clinic, initial consultations are $150-$175 and follow-up treatments range from $85-$120, depending on the services provided during your visit. To make ongoing care more affordable, we offer package deals where you can prepay for multiple sessions at a discounted rate, and we accept HSA and FSA cards. Many insurance plans also cover acupuncture, especially for pain management, which can significantly reduce your out-of-pocket cost. We\'re happy to verify your benefits before your first appointment so you know what to expect. Contact us and we\'ll walk you through pricing, packages, and any coverage you may have.',
  },
  {
    category: 'insurance-payment',
    question: 'Does insurance cover acupuncture in Wisconsin?',
    answer:
      'Many Wisconsin insurance plans now cover acupuncture, particularly for pain management, and coverage has expanded in recent years. Our clinic is in-network with several major providers, including Blue Cross Blue Shield, United Healthcare, Cigna, and Aetna. Because benefits vary from plan to plan, the best way to know your coverage is to verify it before treatment—and we\'re glad to help. Just provide your insurance information and we\'ll check your acupuncture benefits, explain any copays or deductibles, and submit claims on your behalf where possible. If acupuncture isn\'t covered by your plan, we can also provide superbills for out-of-network reimbursement and offer affordable prepaid packages.',
  },
  {
    category: 'our-practice',
    question: 'Where is your acupuncture clinic located?',
    answer:
      'Our clinic is located at 500 W Silver Spring Dr. Ste K205, Glendale, WI 53217. We\'re conveniently situated for patients throughout the greater Milwaukee area and the North Shore communities, including Shorewood, Whitefish Bay, Fox Point, and Bayside. Free on-site parking is available, so getting to your appointment is simple and stress-free. The office offers a quiet, comfortable environment designed to help you relax during treatment. Whether you\'re coming from downtown Milwaukee or one of the surrounding suburbs, we\'re an easy drive away. If you need directions or have questions about parking and accessibility, just give us a call and we\'ll be happy to help.',
  },
  {
    category: 'appointments-policies',
    question: 'Do you offer evening acupuncture appointments?',
    answer:
      'Yes. We offer both daytime and evening appointments during the week to accommodate busy schedules, so you can find a time that works around work, school, or family commitments. Evening slots tend to be the most popular, so we recommend booking in advance to secure your preferred time. To schedule, you can call us, send an email, or use our online booking system, and we\'ll help you find an opening that fits. If you\'re an established patient working through a treatment plan, we\'ll do our best to reserve a consistent recurring time for you. Reach out and we\'ll let you know our current availability for evening visits.',
  },
  {
    category: 'about-acupuncture',
    question: 'Can acupuncture help with seasonal allergies in Wisconsin?',
    answer:
      'Yes, acupuncture is a popular drug-free option for managing seasonal allergies, and it can be especially helpful during Wisconsin\'s spring and fall allergy seasons, when tree, grass, ragweed, and mold pollens are at their peak. Many patients use acupuncture to help ease common symptoms like nasal congestion, sneezing, itchy eyes, and sinus pressure, and to support overall respiratory comfort. It can be used on its own or as a complement to other approaches you may already be using. For the best results, many people begin treatment a few weeks before their typical allergy season starts. During your consultation, we\'ll discuss your symptoms and build a plan suited to your needs.',
  },
];

function makeId(question) {
  return (
    'faq-' +
    question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60)
  );
}

async function seedFaqs() {
  if (!process.env.PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env');
    process.exit(1);
  }

  console.log(dryRun ? '--- DRY RUN (no changes will be made) ---\n' : '--- LIVE RUN ---\n');

  // Fetch existing faq _ids so we can skip ones that already exist.
  const existingIds = new Set(await client.fetch(`*[_type == "faq"]._id`));
  console.log(`Existing faq documents: ${existingIds.size}\n`);

  let created = 0;
  let skipped = 0;
  let order = 0;

  for (const faq of FAQS) {
    const _id = makeId(faq.question);

    if (existingIds.has(_id)) {
      console.log(`  skipping (exists): ${_id}`);
      skipped++;
      continue;
    }

    const doc = {
      _id,
      _type: 'faq',
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: order++,
      featured: false,
    };

    if (dryRun) {
      console.log(`  [dry] would create: ${_id} (${faq.category}, order ${doc.order})`);
    } else {
      console.log(`  creating: ${_id} (${faq.category}, order ${doc.order})`);
      await client.createIfNotExists(doc);
    }
    created++;
  }

  console.log(`\nDone. created=${created} skipped=${skipped} total=${FAQS.length}`);
}

seedFaqs().catch((err) => {
  console.error(err);
  process.exit(1);
});
