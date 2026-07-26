/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_URL: string
    readonly VITE_API_URL: string
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_PADDLE_ENV: string
    readonly VITE_PADDLE_CLIENT_TOKEN: string
    readonly VITE_PADDLE_PRICE_START: string
    readonly VITE_PADDLE_PRICE_PLUS: string
    readonly VITE_PADDLE_PRICE_OPEN_LIBRARY: string
    readonly VITE_PADDLE_PRICE_100_MINS_START: string
    readonly VITE_PADDLE_PRICE_100_MINS_PLUS: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
