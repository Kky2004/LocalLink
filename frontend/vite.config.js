// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // allow access from mobile
    port: 5173,        // default Vite port
    strictPort: true,  // fail if port is busy
  },
  preview: {
    host: true,
    port: 5173,
  }
})