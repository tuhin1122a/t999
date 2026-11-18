// GET /api/auth/mobile/banners
// Returns active banner images from SiteSetting + promotions logo/notice text
// Never returns dummy/unsplash images. Always fresh, no-cache.
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findFirst();

    // Real official RK444 casino banners hosted on rk444.site
    const realRk444Banners = [
      'https://rk444.site/slider/slider-1.jpg',
      'https://rk444.site/slider/slider-2.jpg',
      'https://rk444.site/slider/slider-3.png',
      'https://rk444.site/slider/slider-4.png',
      'https://rk444.site/slider/slider-5.png',
    ];

    const bannerImages =
      settings?.sliderImages && settings.sliderImages.length > 0
        ? settings.sliderImages
        : realRk444Banners;

    return NextResponse.json(
      {
        success: true,
        banners: bannerImages,
        promotionsLogo: settings?.promotionsLogo || null,
        noticeText:
          'Welcome to RK444! Get 50% Welcome Bonus on your first deposit! 24/7 Fast Withdrawals & Instant Deposits.',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('[mobile/banners] Error:', error);
    return NextResponse.json(
      {
        success: true,
        banners: [
          'https://rk444.site/slider/slider-1.jpg',
          'https://rk444.site/slider/slider-2.jpg',
          'https://rk444.site/slider/slider-3.png',
          'https://rk444.site/slider/slider-4.png',
          'https://rk444.site/slider/slider-5.png',
        ],
        promotionsLogo: null,
        noticeText:
          'Welcome to RK444! Official Gaming Platform. 24/7 Fast Withdrawals & Instant Deposits.',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}
