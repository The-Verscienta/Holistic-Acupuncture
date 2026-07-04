/**
 * City landing pages served at /acupuncture/[slug].
 *
 * IMPORTANT: content must stay genuinely distinct per city. Search engines
 * treat near-duplicate location pages as doorway spam, so each entry should
 * speak to that community specifically (who lives there, why they visit,
 * how they get to the clinic). Adding an entry here automatically generates
 * the page, its sitemap entry, and its footer + /service-areas hub links.
 */

export interface LocationEntry {
  slug: string; // URL segment under /acupuncture/
  name: string; // City name
  metaTitle: string;
  metaDescription: string; // 145–160 chars
  intro: string; // hero/intro paragraph
  /** Approximate drive time from this community to the clinic. */
  driveTime: string;
  /** Unique body paragraphs for the "Acupuncture care for {name} residents" section. */
  localParagraphs: string[];
  /** Unique body paragraphs for the "Getting here from {name}" section. */
  directionsParagraphs: string[];
}

export const LOCATIONS: LocationEntry[] = [
  {
    slug: 'glendale',
    name: 'Glendale',
    metaTitle: 'Acupuncture in Glendale, WI',
    metaDescription: 'Acupuncture in Glendale, WI — our clinic is right here in your community. Pain, stress, fertility & wellness care from licensed acupuncturists. Book today.',
    intro: 'Your local acupuncture clinic in Glendale, WI — acupuncture and traditional Chinese medicine for pain, stress, and whole-person wellness.',
    driveTime: 'Right here in Glendale',
    localParagraphs: [
      "If you live in Glendale, you don't have to travel for expert acupuncture — our clinic is part of your community, located at 500 W Silver Spring Dr near the I-43 interchange, just minutes from Bayshore.",
      "Glendale neighbors come to us for the full range of what acupuncture does best: back and neck pain that flares after snow shoveling or yard work, tension headaches, seasonal allergies, stress and restless sleep, digestive complaints, and women's health concerns from fertility support through menopause. And because we're so close to home, it's easy to keep the consistent treatment schedule that produces the best results.",
      "Our licensed acupuncturists have provided more than 380,000 treatments over 25+ years of practice, and every plan begins with a thorough consultation — your health history, lifestyle, and goals shape the treatment, never a one-size-fits-all protocol.",
    ],
    directionsParagraphs: [
      'From anywhere in Glendale, the clinic is a few minutes away at 500 W Silver Spring Dr, Suite K205, just off the I-43 Silver Spring Drive interchange near Bayshore.',
      'Free on-site parking means no hassle at the door, and evening appointments Monday through Thursday make it easy to fit care around work and family.',
    ],
  },
  {
    slug: 'whitefish-bay',
    name: 'Whitefish Bay',
    metaTitle: 'Acupuncture in Whitefish Bay, WI',
    metaDescription: 'Acupuncture for Whitefish Bay, WI residents at our nearby Glendale clinic. Drug-free relief for pain, stress, headaches, fertility & more. Book today.',
    intro: 'Trusted acupuncture and Chinese medicine for Whitefish Bay, WI — whole-person care for pain, stress, sleep, and wellness, close to home.',
    driveTime: 'About 5 minutes',
    localParagraphs: [
      'If you live in Whitefish Bay, our clinic may be the closest established acupuncture practice to your front door. We are located on Silver Spring Drive — the same street that runs through the heart of the village — just a few minutes west of the shops and restaurants of the Silver Spring District.',
      'Whitefish Bay patients come to us for many of the same reasons as neighbors across the North Shore: stubborn neck and shoulder tension from long days at a desk, sports injuries from active kids and weekend athletes, seasonal allergies that flare along the lakefront, and the stress and disrupted sleep that come with juggling work and family. Many patients also see us for fertility support, pregnancy-related discomfort, and menopause symptoms.',
      'Our licensed acupuncturists have provided more than 380,000 treatments over 25+ years of practice, and every plan begins with a thorough consultation — your health history, lifestyle, and goals shape the treatment, never a one-size-fits-all protocol.',
    ],
    directionsParagraphs: [
      'From the village, follow Silver Spring Drive west toward I-43. The clinic is at 500 W Silver Spring Dr, Suite K205 in Glendale, just off the Silver Spring Drive interchange and minutes from Bayshore. Most Whitefish Bay patients make the trip in about five minutes.',
      'Free on-site parking means no circling the block, and evening appointments Monday through Thursday make it easy to come in after work or after school pickup.',
    ],
  },
  {
    slug: 'shorewood',
    name: 'Shorewood',
    metaTitle: 'Acupuncture in Shorewood, WI',
    metaDescription: 'Looking for acupuncture in Shorewood, WI? Our Glendale clinic is minutes away — pain relief, stress, fertility & more. Book your first visit today.',
    intro: 'Acupuncture and traditional Chinese medicine for Shorewood, WI residents — natural relief from pain, stress, and chronic conditions, just minutes from the village.',
    driveTime: 'About 10 minutes',
    localParagraphs: [
      'Shorewood sits just a few minutes south of our Glendale clinic, and we have cared for Shorewood residents — students, professors, young professionals, and longtime villagers alike — for more than two decades.',
      'A lot of Shorewood life happens at a desk or on the move, and we see it in the treatment room. We regularly help UWM students and staff manage stress, anxiety, and poor sleep through demanding semesters; runners and cyclists from the Oak Leaf Trail with knee, hip, and IT band complaints; and professionals with tension headaches and low back pain from commutes and screen time. Acupuncture offers a drug-free way to address these issues at their source rather than masking them.',
      'Depending on your needs, your plan may combine acupuncture with Chinese herbal medicine, cupping therapy, and practical lifestyle guidance — a whole-person approach refined over 25+ years and 380,000+ treatments.',
    ],
    directionsParagraphs: [
      'The most direct route is north on Oakland Avenue into Whitefish Bay, then west on Silver Spring Drive to the clinic at 500 W Silver Spring Dr, Suite K205. You can also take I-43 north and exit at Silver Spring Drive. Either way, most Shorewood patients arrive in about ten minutes.',
      'Free on-site parking is available, and evening hours Monday through Thursday mean you can schedule around classes or the workday.',
    ],
  },
  {
    slug: 'mequon',
    name: 'Mequon',
    metaTitle: 'Acupuncture near Mequon, WI',
    metaDescription: 'Acupuncture near Mequon, WI at our Glendale clinic — licensed acupuncturists treating pain, stress, fertility & more. Free parking. Book your visit.',
    intro: 'Acupuncture and traditional Chinese medicine for Mequon, WI residents — natural, lasting relief at our nearby Glendale clinic.',
    driveTime: '10–15 minutes',
    localParagraphs: [
      "For Mequon and Thiensville residents, our Glendale clinic is a straight shot down I-43 — usually a 10-to-15-minute drive — making us one of the most convenient full-time acupuncture practices for southern Ozaukee County.",
      "Mequon patients often come to us with chronic low back and joint pain, golf and tennis injuries, and the wear and tear that comes with long commutes and large, yard-heavy properties. We also see many patients for women's health — from fertility support through perimenopause — and for the stress, sleep, and healthy-aging concerns that matter to adults who intend to stay active for decades to come.",
      'Because traditional Chinese medicine looks at the whole person, your plan may pair acupuncture with herbal consultations, cupping, and lifestyle guidance. Pricing is transparent, and treatment packages make ongoing care straightforward.',
    ],
    directionsParagraphs: [
      'Take I-43 south and exit at Silver Spring Drive. The clinic is at 500 W Silver Spring Dr, Suite K205, just off the interchange and minutes from Bayshore. From most of Mequon the drive takes 10 to 15 minutes, running opposite the heaviest rush-hour traffic.',
      'Free on-site parking is right at the door, and evening appointments Monday through Thursday let you stop in on the way home rather than making a separate trip.',
    ],
  },
  {
    slug: 'fox-point',
    name: 'Fox Point',
    metaTitle: 'Acupuncture near Fox Point, WI',
    metaDescription: 'Acupuncture near Fox Point, WI at our Glendale clinic — pain, stress, sleep & fertility care from licensed acupuncturists. Free parking. Book today.',
    intro: 'Acupuncture and traditional Chinese medicine for Fox Point, WI — natural, lasting relief close to home.',
    driveTime: 'About 5 minutes',
    localParagraphs: [
      'Fox Point is one of the closest communities to our clinic — most patients head down Port Washington Road or I-43 and arrive in about five minutes, often faster than the drive to a downtown appointment.',
      'Many of our Fox Point patients are longtime North Shore residents focused on staying mobile, comfortable, and independent: we frequently treat arthritis and joint pain, neuropathy, and the accumulated aches that make daily walks and hobbies harder than they should be. We care for younger families too — stress, seasonal allergies, headaches, and sports injuries are all common reasons for a first visit. Our techniques are gentle and adapted to every age and comfort level.',
      'Every course of care starts with an unhurried consultation, including traditional pulse and tongue diagnosis, so your treatment reflects your full health picture — not just the symptom that brought you in.',
    ],
    directionsParagraphs: [
      'Follow Port Washington Road south to Silver Spring Drive, or take I-43 to the Silver Spring Drive exit. The clinic is at 500 W Silver Spring Dr, Suite K205 in Glendale, minutes from Bayshore.',
      'Free on-site parking is steps from the entrance, and daytime and evening appointments Monday through Thursday make scheduling easy.',
    ],
  },
  {
    slug: 'bayside',
    name: 'Bayside',
    metaTitle: 'Acupuncture near Bayside, WI',
    metaDescription: 'Acupuncture near Bayside, WI at our Glendale clinic. Drug-free relief for chronic pain, stress, headaches & more from licensed acupuncturists. Book today.',
    intro: 'Acupuncture and Chinese medicine for Bayside, WI residents — natural relief and whole-person care at our nearby Glendale clinic.',
    driveTime: '5–7 minutes',
    localParagraphs: [
      'Bayside sits at the quiet north end of the North Shore, yet our Glendale clinic is still only a five-to-seven-minute drive away — close enough that regular care never feels like a project.',
      'Many Bayside patients first visit for one stubborn issue — a shoulder that never quite healed, migraines that follow a stressful week, or the hip and knee pain that makes long walks less enjoyable — and stay for the whole-person benefits they notice along the way: sounder sleep, a calmer stress response, and steadier energy. Others come specifically for seasonal allergy relief, digestive complaints, or support through fertility and menopause.',
      'Depending on your needs, your plan may combine acupuncture with Chinese herbal medicine and cupping therapy, always built around a thorough consultation of your health history and goals.',
    ],
    directionsParagraphs: [
      'Take I-43 south to the Silver Spring Drive exit, or follow Port Washington Road south through Fox Point. The clinic is at 500 W Silver Spring Dr, Suite K205 in Glendale, minutes from Bayshore — most Bayside patients arrive in five to seven minutes.',
      'Free on-site parking is right at the door, and appointments run into the evening Monday through Thursday.',
    ],
  },
  {
    slug: 'brown-deer',
    name: 'Brown Deer',
    metaTitle: 'Acupuncture near Brown Deer, WI',
    metaDescription: 'Acupuncture near Brown Deer, WI — about 10 minutes to our Glendale clinic. Effective, drug-free care for back pain, sleep, and stress. 25+ years of experience.',
    intro: 'Effective, drug-free relief about ten minutes from Brown Deer — acupuncture for hard-working backs, shoulders, and sleep-deprived nights.',
    driveTime: 'About 10 minutes',
    localParagraphs: [
      'Brown Deer sits about ten minutes northwest of our Glendale clinic, and we have welcomed Brown Deer patients throughout our 25+ years on the North Shore.',
      'Many of our Brown Deer patients work physically demanding jobs or irregular shifts, and it shows up in the body: low back pain, shoulder and knee trouble, and sleep that never feels quite restorative. Acupuncture is particularly effective for exactly these problems — easing musculoskeletal pain without medication and helping an overworked nervous system reset so sleep comes easier.',
      'We also help with stress, headaches, digestive issues, and general wellness, and we believe care should be accessible: pricing is transparent, treatment packages reduce the per-visit cost, and referral and hardship programs are available.',
    ],
    directionsParagraphs: [
      'Take Brown Deer Road east to I-43 south and exit at Silver Spring Drive, or follow Green Bay Avenue south. The clinic is at 500 W Silver Spring Dr, Suite K205, about ten minutes from most of Brown Deer.',
      'Parking is free and on-site, and appointments run into the evening Monday through Thursday for anyone coming off a day shift.',
    ],
  },
];
