import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash';
import { schemaTypes } from './sanity/schemas';
import { cloudflareImagesTool } from './sanity/tools/cloudflareImages';

export default defineConfig({
  name: 'default',
  title: 'Holistic Acupuncture CMS',

  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || '6b7j3cf0',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',

  tools: [
    cloudflareImagesTool({
      indexUrl: process.env.SANITY_STUDIO_CLOUDFLARE_INDEX_URL || process.env.PUBLIC_APP_URL,
    }),
  ],

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Blog Posts')
              .icon(() => '📝')
              .child(
                S.list()
                  .title('Blog Posts')
                  .items([
                    S.listItem()
                      .title('All Posts')
                      .icon(() => '📋')
                      .child(
                        S.documentTypeList('blog')
                          .title('All Posts')
                          .filter('_type == "blog"')
                      ),
                    S.divider(),
                    ...([
                      { title: 'Wellness', value: 'wellness', icon: '🌿' },
                      { title: 'Pain Management', value: 'pain-management', icon: '💊' },
                      { title: 'Mental Health', value: 'mental-health', icon: '🧠' },
                      { title: "Women's Health", value: 'womens-health', icon: '🌸' },
                      { title: 'Nutrition', value: 'nutrition', icon: '🥗' },
                      { title: 'Getting Started', value: 'getting-started', icon: '🌱' },
                      { title: 'Uncategorized', value: null, icon: '❓' },
                    ].map(({ title, value, icon }) =>
                      S.listItem()
                        .title(`${icon} ${title}`)
                        .child(
                          S.documentTypeList('blog')
                            .title(title)
                            .filter(
                              value === null
                                ? '_type == "blog" && !defined(category)'
                                : '_type == "blog" && category == $cat'
                            )
                            .params(value === null ? {} : { cat: value })
                        )
                    )),
                  ])
              ),
            S.listItem()
              .title('Testimonials')
              .icon(() => '⭐')
              .child(
                S.documentTypeList('testimonial')
                  .title('Testimonials')
                  .filter('_type == "testimonial"')
              ),
            S.listItem()
              .title('Conditions')
              .icon(() => '🏥')
              .child(
                S.documentTypeList('condition')
                  .title('Conditions')
                  .filter('_type == "condition"')
              ),
            S.listItem()
              .title('Team Members')
              .icon(() => '👥')
              .child(
                S.documentTypeList('teamMember')
                  .title('Team Members')
                  .filter('_type == "teamMember"')
              ),
            S.listItem()
              .title('FAQs')
              .icon(() => '❓')
              .child(
                S.documentTypeList('faq')
                  .title('FAQs')
                  .filter('_type == "faq"')
              ),
            S.divider(),
            S.listItem()
              .title('Contact Submissions')
              .icon(() => '📬')
              .child(
                S.documentTypeList('contactSubmission')
                  .title('Contact Submissions')
                  .filter('_type == "contactSubmission"')
                  .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
              ),
          ]),
    }),
    visionTool(),
    unsplashImageAsset(),
  ],

  schema: {
    types: schemaTypes,
  },
});
