import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

export interface Category {
    id: number;
    title: string;
}

export interface Tour {
    id: number;
    category_id: number;
    title: string;
    status: number;
    day: number;
    night: number;
    thumbnail: string;
    description: string;
    short_description: string;
    price_adult: number;
    price_children: number;
    highlights?: string[] | null;
    included?: string[] | null;
    start_date?: string;
    end_date?: string;
    destination?: string;
    capacity?: number;
}

export interface TourSchedule {
    id: number;
    tour_id: number;
    name: string;
    description: string;
    date: number;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
}

export interface TourImage {
    id: number;
    tour_id: number;
    img_url: string;
    alt: string;
    order: number;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
