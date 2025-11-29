import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

export interface ConfirmProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    loading?: boolean;
    isDestructive?: boolean;
}
export interface Policy {
    id: number;
    title: string;
    content: string;
}

export interface TourPolicy {
    id: number;
    policy_id: number;
    tour_id: number;
    policy?: Policy;
}

export interface TourDetailProps {
    tour: Tour;
    categories: Category[];
}

export interface TourHeaderProps {
    tour: Tour;
    categoryName?: string;
    onEdit: () => void;
    onDelete: () => void;
}

export interface TourInfoCardsProps {
    tour: Tour;
}

export interface TourScheduleListProps {
    schedules: TourSchedule[];
    onAdd: () => void;
    onEdit: (item: TourSchedule) => void;
    onDelete: (item: TourSchedule) => void;
}

export interface TourGalleryProps {
    tour: Tour;
    images: TourImage[];
    onAddImage: () => void;
    onDeleteImage: (id: number) => void;
}

export interface Category {
    id: number;
    title: string;
    description: string;
}

export interface Service {
    id: number;
    service_type_id: number;
    provider_id: number;

    name: string;
    description?: string;

    type_room?: number;
    type_car?: number;
    type_meal?: number;

    limit: number;
    unit?: string;
    price: number;
    service_type?: ServiceType;
}

export interface ServiceType {
    id: number;
    name: string;
    description: string;
}

export interface TourService {
    id: number;
    tour_id: number;
    service_id: number;
    quantity: number;
    unit: string;
    price_unit: number;
    price_total: number;
    description: string;
    service?: Service;
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
    images?: TourImage[];
    tour_services?: TourService[];
    schedules?: TourSchedule[];
    tour_policies?:TourPolicy[];
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
