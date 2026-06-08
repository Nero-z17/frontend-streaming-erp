import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Met à jour l'app automatiquement si tu pousses du nouveau code
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Nero ERP', // Le nom complet
        short_name: 'Nero ERP', // Le nom sous le logo sur l'écran du tel
        description: 'Gestion professionnelle des abonnements streaming',
        theme_color: '#000000', // La couleur de la barre de statut du tel (Noir profond pour ton thème)
        background_color: '#000000', // La couleur d'ouverture de l'app
        display: 'standalone', // C'est ça qui enlève la barre de recherche (Mode App)
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
