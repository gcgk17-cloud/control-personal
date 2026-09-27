import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Control Personal',
    short_name: 'Control',
    description: 'Finanzas, alimentación, peso y entrenamiento en un solo lugar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f5f8',
    theme_color: '#101827',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }
}
