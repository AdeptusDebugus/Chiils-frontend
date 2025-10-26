import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,                        // важно, чтобы слушало все хосты
        port: Number(process.env.PORT) || 5173, // Railway требует порт из env
    },
    build: {
        outDir: 'dist',                    // стандартная папка сборки
    },
});