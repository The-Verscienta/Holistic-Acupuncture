/**
 * Short FAQ answers for new patients, shown as expandable questions on the
 * home page and the Services & Pricing page. The full list lives on /faq.
 */
export interface FaqTeaser {
  question: string;
  answer: string;
}

export const NEW_PATIENT_FAQS: FaqTeaser[] = [
  {
    question: 'Does acupuncture hurt?',
    answer: 'Most people feel little to nothing. Acupuncture needles are hair-thin — far finer than the needles used for injections or blood draws. You may notice a slight pinch or a warm, dull sensation, and many patients find treatment deeply relaxing.',
  },
  {
    question: 'How many sessions will I need?',
    answer: 'It depends on your condition. Acute issues may resolve in 3–5 sessions, while chronic conditions often take 8–12 or more. Many patients notice improvement after just a few visits — we create a personalized plan and adjust it as you progress.',
  },
  {
    question: 'Is acupuncture covered by insurance?',
    answer: 'Many plans now cover acupuncture, especially for pain management. We do not bill insurance directly, but we are happy to provide a superbill (detailed receipt) that you can submit to your insurance for possible reimbursement. Contact your insurance provider to check your acupuncture benefits.',
  },
  {
    question: 'What should I wear or bring to my first visit?',
    answer: 'Wear loose, comfortable clothing that rolls up easily above your elbows and knees. Have a light meal an hour or two beforehand rather than coming in hungry, and bring a list of any medications or supplements you take.',
  },
];
