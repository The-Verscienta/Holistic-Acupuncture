/**
 * List contactSubmission documents from Sanity within a given window.
 *
 * Usage:
 *   node scripts/list-contact-submissions.js [--days N]
 *
 * Defaults to last 30 days.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const daysArg = process.argv.indexOf('--days');
const days = daysArg !== -1 ? Number(process.argv[daysArg + 1]) : 30;

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const query = `*[_type == "contactSubmission" && submittedAt >= $since] | order(submittedAt desc) {
  _id,
  submittedAt,
  name,
  email,
  phone,
  referralSource,
  message,
  read
}`;

const submissions = await client.fetch(query, { since });

console.log(`Found ${submissions.length} contact submission(s) in the last ${days} days (since ${since})\n`);

for (const s of submissions) {
  console.log('---');
  console.log(`Submitted: ${s.submittedAt}`);
  console.log(`Name:      ${s.name}`);
  console.log(`Email:     ${s.email}`);
  if (s.phone) console.log(`Phone:     ${s.phone}`);
  if (s.referralSource) console.log(`Referral:  ${s.referralSource}`);
  console.log(`Read:      ${s.read ? 'yes' : 'no'}`);
  console.log(`Message:   ${(s.message || '').replace(/\n/g, ' ').slice(0, 300)}`);
}

if (submissions.length === 0) {
  const totalQuery = `count(*[_type == "contactSubmission"])`;
  const total = await client.fetch(totalQuery);
  console.log(`(Total contactSubmission documents in dataset: ${total})`);
}
