/**
 * Import Google reviews from holisticacupuncture.net/reviews/ into Sanity testimonials.
 *
 * - Skips any review that already exists (matched by author name)
 * - Names are stored as first name + last initial (e.g. "Victoria B.")
 * - condition field is left blank (not available from Google reviews)
 * - All reviews are 5-star
 *
 * Usage:
 *   node scripts/import-google-reviews.js [--dry-run]
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

const isDryRun = process.argv.includes('--dry-run');

function toFirstNameLastInitial(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${first} ${lastInitial}.`;
}

// Reviews scraped from https://holisticacupuncture.net/reviews/
const googleReviews = [
  {
    fullName: 'Victoria Brauer',
    date: '2025-10-15',
    quote: "I was curious about acupuncture for many years, then finally decided to make an appointment. I'm so glad to have discovered this clinic because they have improved my life. I had various health issues for many years and tried different treatments & medications, but the issues came back or got worse. I was frustrated after seeing several doctors and paying too much money for appts/meds that wouldn't make me feel better. I felt a difference after a week of acupuncture treatment and I was hooked. The treatments are very relaxing and I appreciate the education the team provides about acupuncture and healthier living. I highly recommend making an appointment! I'm still blown away by the results after coming here for 2 years.",
  },
  {
    fullName: 'Lori Kuehn',
    date: '2025-09-26',
    quote: "I want to thank my acupuncturist. After six months of neck pain, I felt immediate relief after my first session.",
  },
  {
    fullName: 'Tamara mcc6',
    date: '2025-09-20',
    quote: "Acupuncture has been a life changer for me. I thought this was going to be a way of living the rest of my life in pain. Acupuncture has been great experience for me. So glad I gave it a try. Awesome team of people who are gentle and compassionate.",
  },
  {
    fullName: 'Dan Ney',
    date: '2025-09-20',
    quote: "The AHHA team is amazing and a blessing to our community!! I had no idea of the benefits from acupuncture. Late July my back locked up out of the blue. It was so sever that somedays I couldn't get out of bed. I saw a chiropractor which did help but still had a lot of pain. I then reached out to my primary physician and tried muscle relaxers which made me drowsy and still in a lot of pain. I was worried that this may lead to surgery, I was referred to try acupuncture. I reached out to AHHA and that same day had an appointment and received my first treatment. After just the first treatment I had a huge gain in relief from the pain. After 5 weeks, I'm completely pain free and back to full function. The treatments are easy and only take about a half hour. The team makes everything seamless and they really care about you. I recommend acupuncture and highly recommend the AHHA team for anyone that has experienced a back issue like I did and in general to improve their health! Very blessed that they are so close to home!",
  },
  {
    fullName: 'Jenny Benjamin',
    date: '2025-09-09',
    quote: "I have had jaw pain for years because I have TMJ. It has gotten worse in the last couple of years because of dental work. TMJ has many adverse symptoms beyond jaw pain: neck pain, sinus trouble, vertigo, headaches, and eye strain. I've experienced all of those related problems due to TMJ. After going to the emergency room with a migraine that stemmed from a TMJ flare up, I sought out treatment at Acupuncture & Holistic Health Associates. The team's expertise, kindness, empathy, and professionalism drew me in right away, and after a few weeks of treatment I started to feel much better. After a few months of treatment, I am pain free and realize how much pain I had been enduring on a daily basis before getting help from Acupuncture & Holistic Health Associates. I cannot praise, recommend, or rate this team high enough; the relief their care has brought me has changed my life.",
  },
  {
    fullName: 'Betty Schmidt',
    date: '2025-09-05',
    quote: "In the spring of 2025 I found myself in severe pain in my arms, shoulders, wrists and fingers. I wasn't able to do everyday things like dressing myself. The pain was so severe I couldn't sleep. I was put on a pain medication that helped a little. A specialist told me my pain was my new normal. Facing assisted living was not for me. I found AHHA ( the only original style acupuncture clinic). After the first session the pain started to lessen. After several sessions I was able to stop my strong pain meds. I am now able to live my life again and do everything! I no longer need to hire a caregiver. A big thank you to Acupuncture & Holistic Health Associates. It's been amazing!",
  },
  {
    fullName: 'Bill Pierce',
    date: '2025-09-03',
    quote: "I was in bad shape a few months ago and found my way into Acupuncture and Holistic Health and I can now say it was one of the best decisions in my life. I was dealing with IBS and pain in my hips and back and now I feel so much better I can hardly believe it. My IBS is a non issue and after taking medicine for heartburn for over a decade I am completely off the meds now. I'm able to work out as the tension in my hips and back has left. The amazing kind and compassionate staff as well as the treatments and herbs have helped so much I'll always be grateful and happy I took the leap of faith and checked them out.",
  },
  {
    fullName: 'Crystal Lu',
    date: '2025-08-29',
    quote: "Only one month of treatment and I've had a wonderful experience at Acupuncture and Holistic Health Associates. Acupuncture has helped me tremendously with my digestive health, as well as my neck and back pain. Not only do I feel better overall, but I also notice I have more energy and feel overall healthy! The staff is always on top of their \"A\" game and genuinely takes the time to get to know their patients. What I appreciate most is they educate you so you can take the right steps toward improving your health. They make it clear that your care is a partnership: if you combine acupuncture with the proper lifestyle changes, you'll see great results. If you only rely on the sessions without making changes, you may miss out on the full benefits. I highly recommend them to anyone looking for a natural, supportive, and effective approach to better health.",
  },
  {
    fullName: 'Deborah Anderson',
    date: '2025-08-05',
    quote: "Truly an amazing experience with tangible results. Everyone is professional, engaging and responsive to your personal journey toward optimal health!",
  },
  {
    fullName: 'Tamara Martinsek',
    date: '2025-04-08',
    quote: "I was skeptical. But decided that some of the things I have been relying on western medicine to fix had hit a plateau of healing and were not going to get better. So after a discussion with my fav nurse practitioner about alternative options for both my physical and mental health I decided to accept an offer for a review and introductory session. It has been about 6 months and I am 100% invested and seeing great results. A combination of herbs and weekly sessions have totally turned my life around. Less pain, more energy, better mood, no longer depressed, losing weight, and I have cut down on medication scripted by my GP with no ill effects. We even dealt with a major injury in December without medication or physical therapy. My only regret is that I didn't do this sooner! And the team is the best!",
  },
  {
    fullName: 'Shelly Sabourin',
    date: '2025-02-05',
    quote: "As a nurse, extremely impressed with the way the team approaches health, wellness, education, and treatment. After two sessions, I am pain free from an acute issue after traveling. Highly recommend incorporating acupuncture into your health maintenance routine! I give them 5++++ stars! It's been an incredible experience.",
  },
  {
    fullName: 'Michele Ripp',
    date: '2021-01-13',
    quote: "I love everything about AHHA -- from the staff, to the treatment plan, specifically curated to address my ailments. It's amazing to see positive results after only a couple of treatments. Between receiving treatment and a specially formulated herbal blend, my lower back and neck pain have not returned. Thank you for always extending a warm welcome and improving my overall health.",
  },
  {
    fullName: 'John Zamorski',
    date: '2020-08-24',
    quote: "Acupuncture Needles! Scares a LOT of people if they have never experienced the treatments. Let me immediately ease your mind — the tiny thin needles cause no discomfort at all. I first experienced acupuncture about twelve years ago for pretty severe shoulder pain from lifting something I shouldn't have alone. They sat me down, stuck a few pins in me, told me to relax for about fifteen minutes and the pain disseminated. I was impressed. They explained the pain relief was temporary but if I repeated the process three times a week for a couple of weeks, the pain would go away and stay away. I returned this past January when I got shingles in my right arm and lost total mobility of my right arm. My doctor and a neuro-orthopedic sports medicine doctor couldn't agree on a cause. I called AHHA and I am happy to report my arm is 100% fully recovered — full mobility, no pain. The staff are Rock Stars. From the front desk to the acupuncturists, everyone treats you like family. I could not ask for more.",
  },
];

async function main() {
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Reviews to import: ${googleReviews.length}\n`);

  // Fetch existing testimonials to avoid duplicates
  const existing = await client.fetch(`*[_type == "testimonial"]{ author }`);
  const existingNames = new Set(existing.map((t) => t.author.toLowerCase()));
  console.log(`Existing testimonials in Sanity: ${existing.length}`);

  let created = 0;
  let skipped = 0;

  for (const review of googleReviews) {
    const author = toFirstNameLastInitial(review.fullName);

    if (existingNames.has(author.toLowerCase())) {
      console.log(`  SKIP (already exists): ${author}`);
      skipped++;
      continue;
    }

    const doc = {
      _type: 'testimonial',
      author,
      quote: review.quote,
      rating: 5,
      date: review.date,
      featured: false,
      verified: true,
    };

    if (isDryRun) {
      console.log(`  DRY RUN - would create: ${author} (${review.date})`);
    } else {
      await client.create(doc);
      console.log(`  CREATED: ${author} (${review.date})`);
    }
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
