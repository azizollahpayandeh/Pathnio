import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { detail: 'نام، ایمیل و پیام الزامی هستند.' },
        { status: 400 }
      );
    }

    // Send to Django backend
    const base = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://pathnio-backend.vercel.app';
    const apiUrl = `${base.replace(/\/$/, '')}/api/accounts/contact/`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        subject: body.subject || 'Contact Form Submission',
        message: body.message,
      }),
    });

    if (response.ok) {
      return NextResponse.json(
        { detail: 'پیام با موفقیت ارسال شد.' },
        { status: 201 }
      );
    } else {
      const errorData = await response.json();
      return NextResponse.json(
        { detail: errorData.detail || 'خطا در ارسال پیام.' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { detail: 'خطا در اتصال به سرور.' },
      { status: 500 }
    );
  }
} 