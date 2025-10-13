// Demo script to show snapshot data loading
import { queryUpdates } from '../src/lib/cosmosClient.js';

// Set environment to use snapshot data
process.env.DATA_MODE = 'snapshot';

async function demo() {
  console.log('🎬 Snapshot Data Demo\n');
  console.log('Loading snapshot data...\n');

  // Get all updates
  const allUpdates = await queryUpdates({ query: 'SELECT * FROM c' }, 100);
  
  console.log(`✅ Loaded ${allUpdates.length} total items\n`);

  // Count by type
  const byType = {
    update: allUpdates.filter(u => u.type === 'update').length,
    blog: allUpdates.filter(u => u.type === 'blog').length,
    video: allUpdates.filter(u => u.type === 'video').length
  };

  console.log('📊 Items by type:');
  console.log(`  - Updates: ${byType.update}`);
  console.log(`  - Blogs: ${byType.blog}`);
  console.log(`  - Videos: ${byType.video}\n`);

  // Get categories
  const categories = await queryUpdates({ 
    query: 'SELECT DISTINCT VALUE c FROM u JOIN c IN u.categories' 
  }, 100);

  console.log(`📋 ${categories.length} unique categories found:`);
  categories.slice(0, 10).forEach(cat => console.log(`  - ${cat}`));
  if (categories.length > 10) {
    console.log(`  ... and ${categories.length - 10} more\n`);
  } else {
    console.log('');
  }

  // Show sample items
  console.log('📄 Sample items:\n');
  
  const sampleBlog = allUpdates.find(u => u.type === 'blog');
  if (sampleBlog) {
    console.log('📝 Sample Blog Post:');
    console.log(`  Title: ${sampleBlog.title}`);
    console.log(`  Source: ${sampleBlog.source}`);
    console.log(`  Author: ${sampleBlog.author}`);
    console.log(`  Categories: ${sampleBlog.categories.join(', ')}`);
    console.log(`  Date: ${new Date(sampleBlog.publishedDate).toLocaleDateString()}\n`);
  }

  const sampleVideo = allUpdates.find(u => u.type === 'video');
  if (sampleVideo) {
    console.log('🎥 Sample Video:');
    console.log(`  Title: ${sampleVideo.title}`);
    console.log(`  Source: ${sampleVideo.source}`);
    console.log(`  Categories: ${sampleVideo.categories.join(', ')}`);
    console.log(`  Link: ${sampleVideo.link}\n`);
  }

  console.log('✨ This is real data from Azure RSS feeds!');
  console.log('🔄 Refresh with: npm run snapshot:create\n');
}

demo().catch(console.error);
