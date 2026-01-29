// Quick script to list WordPress posts
import fetch from 'node-fetch';

async function listPosts() {
  try {
    const response = await fetch('https://holisticacupuncture.net/wp-json/wp/v2/posts?per_page=100');
    const posts = await response.json();

    console.log(`\n📊 Total posts found: ${posts.length}\n`);
    console.log('='.repeat(80));

    posts.forEach((post, i) => {
      const title = post.title.rendered;
      const date = post.date.substring(0, 10);
      const status = post.status;
      const id = post.id;
      const excerpt = post.excerpt.rendered
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&hellip;/g, '...')
        .trim()
        .substring(0, 150);

      const categories = post.categories?.length || 0;
      const tags = post.tags?.length || 0;
      const hasFeaturedImage = post.featured_media > 0;

      console.log(`\n${i + 1}. [ID: ${id}] ${title}`);
      console.log(`   📅 Date: ${date} | Status: ${status}`);
      console.log(`   🏷️  Categories: ${categories} | Tags: ${tags} | Featured Image: ${hasFeaturedImage ? '✅' : '❌'}`);
      console.log(`   📝 ${excerpt}${excerpt.length >= 150 ? '...' : ''}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Found ${posts.length} blog posts ready for migration\n`);
  } catch (error) {
    console.error('❌ Error fetching posts:', error.message);
  }
}

listPosts();
