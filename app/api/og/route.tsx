import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'ian nuttall';
    const tagline = "tldr; serial internet biz builder, 100+ exits. always learning. usually from my mistakes.";
    const wrappedTagline = wrapText(tagline, 60);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            fontFamily: 'sans-serif',
            padding: '60px',
          }}
        >
          <h1
            style={{ 
              fontSize: '72px', 
              color: '#ffffff', 
              marginBottom: '40px',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '90%',
            }}
          >
            {title}
          </h1>
          <div
            style={{ 
              fontSize: '32px', 
              color: '#888888', 
              maxWidth: '90%', 
              textAlign: 'center', 
              lineHeight: '1.4',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {wrappedTagline.map((line, index) => (
              <span key={index} style={{ margin: '0 0 10px 0' }}>{line}</span>
            ))}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('OG Image generation error:', e);
    return new Response(`Failed to generate image: ${e instanceof Error ? e.message : 'Unknown error'}`, {
      status: 500,
    });
  }
}