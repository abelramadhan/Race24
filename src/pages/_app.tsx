import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { ThemeProvider } from '@material-tailwind/react';
import { SocketProvider } from '@/lib/context/socketContext';
import { GameStateContextProvider } from '@/lib/context/gameStateContext';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider>
            <SocketProvider>
                <GameStateContextProvider>
                    <Component {...pageProps} />
                </GameStateContextProvider>
            </SocketProvider>
        </ThemeProvider>
    );
}
