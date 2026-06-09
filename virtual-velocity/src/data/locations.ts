export interface LocationEntry {
  slug: string;        // URL segment under /acupuncture/
  name: string;        // City name
  metaTitle: string;
  metaDescription: string;  // 145–160 chars
  intro: string;       // hero/intro paragraph
  proximity: string;   // factual proximity-to-Glendale-clinic sentence
}

export const LOCATIONS: LocationEntry[] = [
  {
    slug: 'shorewood',
    name: 'Shorewood',
    metaTitle: 'Acupuncture in Shorewood, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Looking for acupuncture in Shorewood, WI? Our Glendale clinic is minutes away — pain relief, stress, fertility & more. Book your first visit today.',
    intro: 'Acupuncture and traditional Chinese medicine for Shorewood, WI residents — natural relief from pain, stress, and chronic conditions, just minutes from the village.',
    proximity: 'Our clinic in Glendale is a short drive north of Shorewood, making regular acupuncture care easy to fit into your routine.',
  },
  {
    slug: 'whitefish-bay',
    name: 'Whitefish Bay',
    metaTitle: 'Acupuncture in Whitefish Bay, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture for Whitefish Bay, WI residents at our nearby Glendale clinic. Drug-free relief for pain, stress, headaches, fertility & more. Book today.',
    intro: 'Trusted acupuncture and Chinese medicine for Whitefish Bay, WI — whole-person care for pain, stress, sleep, and wellness, close to home.',
    proximity: 'Whitefish Bay neighbors Glendale, so our clinic is only a few minutes away for convenient, consistent treatment.',
  },
  {
    slug: 'mequon',
    name: 'Mequon',
    metaTitle: 'Acupuncture near Mequon, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture near Mequon, WI at our Glendale clinic — licensed acupuncturists treating pain, stress, fertility & more. Free parking. Book your visit.',
    intro: 'Acupuncture and traditional Chinese medicine for Mequon, WI residents — natural, lasting relief at our nearby Glendale clinic.',
    proximity: 'Just south of Mequon, our Glendale location offers an easy drive down for appointments.',
  },
  {
    slug: 'glendale',
    name: 'Glendale',
    metaTitle: 'Acupuncture in Glendale, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture in Glendale, WI — our clinic is right here in your community. Pain, stress, fertility & wellness care from licensed acupuncturists. Book today.',
    intro: 'Your local acupuncture clinic in Glendale, WI — acupuncture and traditional Chinese medicine for pain, stress, and whole-person wellness.',
    proximity: 'Our clinic is located right here in Glendale with free parking and flexible weekday and evening appointments.',
  },
  {
    slug: 'bayside',
    name: 'Bayside',
    metaTitle: 'Acupuncture near Bayside, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture near Bayside, WI at our Glendale clinic. Drug-free relief for chronic pain, stress, headaches & more from licensed acupuncturists. Book today.',
    intro: 'Acupuncture and Chinese medicine for Bayside, WI residents — natural relief and whole-person care at our nearby Glendale clinic.',
    proximity: 'A short drive south brings Bayside residents to our Glendale clinic.',
  },
  {
    slug: 'fox-point',
    name: 'Fox Point',
    metaTitle: 'Acupuncture near Fox Point, WI | Acupuncture & Holistic Health Associates',
    metaDescription: 'Acupuncture near Fox Point, WI at our Glendale clinic — pain, stress, sleep & fertility care from licensed acupuncturists. Free parking. Book today.',
    intro: 'Acupuncture and traditional Chinese medicine for Fox Point, WI — natural, lasting relief close to home.',
    proximity: 'Fox Point is just minutes from our Glendale clinic for convenient, regular care.',
  },
];
