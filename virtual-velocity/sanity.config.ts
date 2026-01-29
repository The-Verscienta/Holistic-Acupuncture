import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'Holistic Acupuncture CMS',

  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || '6b7j3cf0',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',

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
                S.documentTypeList('blog')
                  .title('Blog Posts')
                  .filter('_type == "blog"')
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
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
