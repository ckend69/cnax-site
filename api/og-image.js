// api/og-image.js — generates the Open Graph image as a PNG via @vercel/og
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #03030a 0%, #07071a 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        },
        children: [
          // Logo mark
          {
            type: 'div',
            props: {
              style: {
                width: 80,
                height: 80,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 700,
                color: 'white',
                marginBottom: 24,
              },
              children: 'CX',
            },
          },
          // Wordmark
          {
            type: 'div',
            props: {
              style: { fontSize: 58, fontWeight: 700, color: 'white', marginBottom: 16, letterSpacing: '-2px' },
              children: 'CNAX AI',
            },
          },
          // Tagline
          {
            type: 'div',
            props: {
              style: { fontSize: 24, color: 'rgba(255,255,255,0.55)', marginBottom: 32 },
              children: 'Intelligent Systems for Modern Business',
            },
          },
          // Divider
          {
            type: 'div',
            props: {
              style: {
                width: 160,
                height: 3,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                marginBottom: 28,
              },
            },
          },
          // Sub-tagline
          {
            type: 'div',
            props: {
              style: { fontSize: 18, color: 'rgba(255,255,255,0.35)' },
              children: 'AI Integration · Sales Funnels · Workflow Automation',
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
}
