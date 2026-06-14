/**
 * Seeds the database with Cardan's real starter content. Safe to re-run: it
 * clears each collection first. Run with `npm run seed` after setting MONGODB_URI.
 *
 * Extend these arrays (or import from the frontend's data/content.ts) to load
 * the full catalogue.
 */
import { connectDb, disconnectDb } from './config/db';
import { Project } from './models/Project';
import { Product } from './models/Product';
import { News } from './models/News';

const projects = [
  {
    title: 'UPS System Installation',
    client: 'Nigerian Bottling Company (NBC), Abuja',
    images: [
      '/images/resource/project/ups.png',
      '/images/resource/project/ups1.png',
    ],
  },
  {
    title: 'Cable Arrangement & Management',
    client: 'Unilever Factory',
    images: [
      '/images/resource/project/ups2.png',
      '/images/resource/project/ups3.png',
    ],
  },
  {
    title: 'Generator Synchronization',
    client: 'Unilever Factory & Unilever Ibadan',
    images: [
      '/images/resource/project/gen.png',
      '/images/resource/project/gen1.png',
      '/images/resource/project/gen2.png',
    ],
  },
  {
    title: 'Control Panel Installation',
    client: 'NBC Coca-Cola Plant',
    images: ['/images/resource/project/panel.png'],
  },
  {
    title: 'Hansa Cooling Unit Installation',
    client: 'Unilever Ibadan',
    images: [
      '/images/resource/project/cool1.png',
      '/images/resource/project/cool2.png',
    ],
  },
];

const products = [
  {
    name: 'MB Distribution Board',
    brand: 'Alfanar',
    image: '/images/resource/product/product1.png',
  },
  {
    name: 'MF Switchgear',
    brand: 'Alfanar',
    image: '/images/resource/product/product3.png',
  },
  {
    name: 'Delta Cable Ladder',
    brand: 'Transdelta',
    image: '/images/resource/product/product2/3.png',
  },
];

const news = [
  {
    title: 'Cardan Engineering completes UPS installation for NBC',
    excerpt:
      'Our engineers delivered a full UPS system installation for the Nigerian Bottling Company, ensuring uninterrupted power for critical plant operations.',
    body: 'Cardan Engineering Limited successfully designed, supplied and commissioned an uninterruptible power supply (UPS) system for the Nigerian Bottling Company in Abuja, delivered on time and to specification by our certified engineers.',
    image: '/images/resource/project/ups.png',
    date: '2026-05-12',
    published: true,
  },
];

async function seed() {
  await connectDb();
  await Promise.all([
    Project.deleteMany({}),
    Product.deleteMany({}),
    News.deleteMany({}),
  ]);
  await Project.insertMany(projects);
  await Product.insertMany(products);
  await News.insertMany(news);
  console.log(
    `[seed] inserted ${projects.length} projects, ${products.length} products, ${news.length} news`
  );
  await disconnectDb();
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
