import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface UserDetail {
    phone: string | null;
    avatar: string | null;
    // ... các trường khác
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role: number; // 0 | 1 | 2 | 3
    is_active: boolean;
    created_at: string;
    updated_at: string;
    detail?: UserDetail; // Quan hệ detail có thể null
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginatedUsers {
    data: User[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface ConfirmProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    loading?: boolean;
    isDestructive?: boolean;
}
// Interface cho Địa điểm (Country, Province, Destination)
export interface Country {
    id: number;
    name: string;
    code: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    provinces?: Province[];
}

export interface Province {
    id: number;
    country_id: number; // Khóa ngoại
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    country?: Country;
    destinations?: Destination[];
    tours?: Tour[];
    providers?: Provider[];
}

export interface Destination {
    id: number;
    id_provinces: number; // Khóa ngoại
    name: string;
    description: string | null;
    address: string | null;
    status: '0' | '1'; // Enum trả về string
    created_at: string;
    updated_at: string; // Laravel mặc định dùng snake_case
    deleted_at: string | null;
    province?: Province;
}

// Interface cho Dịch vụ (ServiceType, Provider, Service, ServiceAttribute)
export interface ServiceType {
    id: number;
    name: string;
    description: string;
    services?: Service[];
}

export interface Provider{
    id: number;
    province_id: number;
    name: string;
    description: string;
    email: string;
    hotline: string;
    address: string;
    website: string;
    status: number;
    notes: string;
    province?: Province;
    services?: Service[];
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
    provider?: Provider;
    service_attributes?: ServiceAttribute[];
}

export interface ServiceAttribute{
    id: number;
    service_id: number;
    name: string;
    value: string;
    type: string;
    service?: Service;
}

// Interface cho Tour (Category, Tour, TourService, TourSchedule, TourImage, TourPolicy)

export interface Category {
    id: number;
    title: string;
    description: string;
    tours?: Tour[];
}

export interface Tour {
    id: number;
    category_id: number;
    destination_id: number;
    title: string;
    status: number;
    day: number;
    night: number;
    date_start: string;
    date_end: string;
    limit: number;
    thumbnail: string;
    description: string;
    short_description: string;
    price_adult: number;
    price_children: number;
    highlights?: string[] | null;
    included?: string[] | null;
    start_date?: string;
    end_date?: string;
    province?: Province;
    category?: Category;
    capacity?: number;
    images?: TourImage[];
    tour_services?: TourService[];
    schedules?: TourSchedule[];
    tour_policies?: TourPolicy[];
}

export interface TourPolicy {
    id: number;
    policy_id: number;
    tour_id: number;
    policy?: Policy;
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

export interface TourSchedule {
    id: number;
    tour_id: number;
    destination_id: number;
    name: string;
    description: string;
    date: number;
    destination: Destination;
}

export interface TourImage {
    id: number;
    tour_id: number;
    img_url: string;
    alt: string;
    order: number;
}

export interface TourDetailProps {
    tour: Tour;
    categories: Category[];
}

export interface Policy {
    id: number;
    title: string;
    content: string;
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

export interface TripAssignment {
    id: number;
    tour_id: number;
    user_id: number;
    status: '0' | '1' | '2' | '3';
    user?: User; // Quan hệ
}

