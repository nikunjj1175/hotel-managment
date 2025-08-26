import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from '../store';
import '../styles.css';
import { Toaster } from 'react-hot-toast';
import { setAuth, setHydrated } from '../store/slices/authSlice';
import { ToastProvider } from '../components/Toast';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

function Boot() {
  useEffect(() => {
    // Set hydrated to true immediately - NO MORE LOADING ISSUES
    setTimeout(() => {
      store.dispatch(setHydrated());
    }, 100);
    
    // hydrate axios auth header if token exists
    const raw = typeof window !== 'undefined' ? localStorage.getItem('auth') : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          // lazy import to avoid SSR axios global side effects
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const axios = require('axios');
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
          // also hydrate redux
          store.dispatch(setAuth({ token: parsed.token, user: parsed.user }));
        }
      } catch {}
    }
    
    // background refresh access token every 25 minutes
    const interval = setInterval(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const axios = require('axios');
        const res = await axios.post('/api/auth/refresh');
        if (res?.data?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          if (typeof window !== 'undefined') {
            const raw2 = localStorage.getItem('auth');
            if (raw2) {
              const parsed2 = JSON.parse(raw2);
              localStorage.setItem('auth', JSON.stringify({ ...parsed2, token: res.data.token }));
              store.dispatch(setAuth({ token: res.data.token, user: parsed2.user }));
            }
          }
        }
      } catch {}
    }, 25 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <div className={`${inter.className} antialiased`}>
          <Boot />
          <Toaster position="top-right" />
          <Component {...pageProps} />
        </div>
      </ToastProvider>
    </Provider>
  );
}


