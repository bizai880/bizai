"use client";
import { CldImage } from "next-cloudinary";

// By default, the CldImage component applies auto-format and auto-quality to all delivery URLs for optimized delivery.
export default function Page() {
	return (
		<CldImage
			src="cld-sample-5" // Use this sample image or upload your own via the Media Library
			width="500" // Transform the image: auto-crop to square aspect_ratio
			height="500"
			crop={{
				type: "auto",
				source: true,
			}}
		/>
	);
}

export default function HomePage() {
  return (
    <main style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1>🚀 BizAI Platform</h1>
      <p>Next.js 15 with App Router</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>System Information:</h3>
        <ul>
          <li>Next.js: 15.5.9</li>
          <li>Node.js: {process.version}</li>
          <li>Build Time: {new Date().toLocaleString()}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Quick Links:</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <a href="/api/health" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
            API Health
          </a>
          <a href="/dashboard" style={{ padding: '0.5rem 1rem', background: '#7928ca', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
            Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}
