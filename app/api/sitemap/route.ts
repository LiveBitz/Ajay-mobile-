import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all products for sitemap
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      take: 50000, // Sitemap limit
    });

    // Get all categories
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    // Generate XML sitemap
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://souled.com';

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Categories -->
  ${categories
    .map(
      (cat) => `
  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <lastmod>${cat.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `
    )
    .join('')}

  <!-- Products -->
  ${products
    .map(
      (product) => `
  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  `
    )
    .join('')}

  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/cart</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/signup</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=43200', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
