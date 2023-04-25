import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { ThemeProvider } from '@material-tailwind/react';
import { SocketProvider } from '@/lib/context/socketContext';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider>
            <SocketProvider>
                <Component {...pageProps} />
            </SocketProvider>
        </ThemeProvider>
    );
}
