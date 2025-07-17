import { NextRequest, NextResponse } from 'next/server';
import { uploadAudioToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const questionId = formData.get('questionId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `answer-${questionId}-${timestamp}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadAudioToCloudinary(buffer, filename);

    // Return the Cloudinary URL
    const audioUrl = (uploadResult as { secure_url: string }).secure_url;

    return NextResponse.json({ 
      audioUrl,
      publicId: (uploadResult as { public_id: string }).public_id,
      message: 'Audio uploaded successfully to Cloudinary' 
    });

  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload audio file' },
      { status: 500 }
    );
  }
}
