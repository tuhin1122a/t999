// GET /api/auth/mobile/banners
// Returns active banner images from SiteSetting + promotions logo/notice text
// This uses the EXISTING SiteSetting model (sliderImages array) from the admin dashboard
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch the site settings (there's typically one row)
    const settings = await prisma.siteSetting.findFirst();

    // Fallback banners in case nothing is configured yet
    const fallbackBanners = [
      'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=800&auto=format&fit=crop',
    ];

    const bannerImages =
      settings?.sliderImages && settings.sliderImages.length > 0
        ? settings.sliderImages
        : fallbackBanners;

    return NextResponse.json({
      success: true,
      banners: bannerImages,
      promotionsLogo: settings?.promotionsLogo || null,
      // notice text can come from SiteConfig if you add it later
      noticeText:
        'rk444 🌟 আপনার প্রথম জমাতে 50% বোনাস পান! 🎉 নিরাপদ ও বিশ্বস্ত গেমিং প্ল্যাটফর্ম।',
    });
  } catch (error) {
    console.error('[mobile/banners] Error:', error);
    // Even on DB error, return fallback so app doesn't break
    return NextResponse.json({
      success: true,
      banners: [
        'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=800&auto=format&fit=crop',
      ],
      promotionsLogo: null,
      noticeText:
        'rk444 🌟 আপনার প্রথম জমাতে 50% বোনাস পান! 🎉 নিরাপদ ও বিশ্বস্ত গেমিং প্ল্যাটফর্ম।',
    });
  }
}
