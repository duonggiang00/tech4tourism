import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/RichTextEditor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import tourUrl from '@/routes/tours';
import { Category, Country, Destination, Policy, User } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    MapPin,
    Plus,
    Search,
    Trash2,
    UploadCloud,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Interface cho Guide với thông tin đã có tour
interface GuideWithStatus extends User {
    has_active_tour?: boolean;
}

// Props nhận từ Controller
interface CreateProps {
    categories: Category[];
    policies: Policy[];
    guides: GuideWithStatus[];
    countries: Country[];
}

// Kiểu dữ liệu cho Lịch trình (Frontend Only)
interface TempSchedule {
    name: string;
    description: string;
    destination_id: string;
    date: number;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
}

// Kiểu dữ liệu cho Tour Service (Frontend Only)
interface TempTourService {
    service_id: string;
    service_name?: string;
    quantity: number;
    unit: string;
    price_unit: number;
    price_total: number;
    description: string;
}

export default function Create({
    categories,
    policies,
    guides,
    countries,
}: CreateProps) {
    // --- 1. SETUP FORM ---
    // Loại bỏ các field instance: date_start, limit, price_adult, price_children, status, guide_ids
    // Các field này sẽ được tạo ở TourInstances/Create.tsx
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        province_id: '',
        title: '',
        day: 1,
        night: 0,
        thumbnail: null as File | null,
        description: '',
        short_description: '',

        gallery_images: [] as File[],
        schedules: [] as TempSchedule[],
        tour_services: [] as TempTourService[],
        policy_ids: [] as number[],
        guide_ids: [] as number[], // Cho phép gán guide ở template level
    });

    // --- STATE CHO LOCATION PANEL (LOCAL UI STATE) ---
    const [selectedCountryId, setSelectedCountryId] = useState<string>('');
    const [searchCountry, setSearchCountry] = useState('');
    const [searchProvince, setSearchProvince] = useState('');

    // --- 2. LOGIC LỌC DỮ LIỆU ---

    // Lọc danh sách Quốc gia theo ô tìm kiếm
    const filteredCountries = useMemo(() => {
        return countries.filter((c) =>
            c.name.toLowerCase().includes(searchCountry.toLowerCase()),
        );
    }, [countries, searchCountry]);

    // Lấy danh sách Tỉnh theo Quốc gia đã chọn
    const filteredProvinces = useMemo(() => {
        const country = countries.find(
            (c) => String(c.id) === selectedCountryId,
        );
        const provinces = country?.provinces || [];
        return provinces.filter((p) =>
            p.name.toLowerCase().includes(searchProvince.toLowerCase()),
        );
    }, [countries, selectedCountryId, searchProvince]);

    // Tìm Tỉnh hiện tại đang chọn (để lấy providers, services, destinations)
    const selectedProvince = useMemo(() => {
        for (const country of countries) {
            const found = country.provinces?.find(
                (p) => String(p.id) === data.province_id,
            );
            if (found) return found;
        }
        return null;
    }, [data.province_id, countries]);

    // Lấy danh sách Địa điểm (QUAN TRỌNG: Dùng biến này cho cả Panel và List Lịch trình)
    const availableDestinations = useMemo(() => {
        return selectedProvince?.destinations || [];
    }, [selectedProvince]);

    // Lấy danh sách Dịch vụ
    const availableServices = useMemo(() => {
        if (!selectedProvince?.providers) return [];
        return selectedProvince.providers.flatMap((provider) =>
            (provider.services || []).map((service) => ({
                ...service,
                displayName: `${service.name} - ${provider.name}`,
            })),
        );
    }, [selectedProvince]);

    // --- HANDLER CHO LOCATION PANEL ---

    const handleSelectCountry = (id: string) => {
        setSelectedCountryId(id);
        setData((prevData) => ({
            ...prevData,
            province_id: '',
            schedules: [],
            tour_services: [],
        }));
        setSearchProvince('');
    };

    const handleSelectProvince = (id: string) => {
        if (data.province_id === id) return;
        setData((prevData) => ({
            ...prevData,
            province_id: id,
            schedules: [],
            tour_services: [],
        }));
    };

    const handleToggleDestination = (dest: Destination, checked: boolean) => {
        if (checked) {
            // Tự động thêm vào lịch trình (Không kiểm tra số ngày nữa)
            const newSchedule: TempSchedule = {
                name: `Tham quan ${dest.name}`,
                description: dest.description || `Khám phá ${dest.name}`,
                destination_id: String(dest.id),
                date: data.schedules.length + 1,
                breakfast: true,
                lunch: true,
                dinner: true,
            };
            setData('schedules', [...data.schedules, newSchedule]);
        } else {
            const newSchedules = data.schedules.filter(
                (s) => s.destination_id !== String(dest.id),
            );
            setData('schedules', newSchedules);
        }
    };

    // --- 3. HANDLERS (ẢNH) ---
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    );
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file));
            setData('thumbnail', file);
        }
    };
    const handleRemoveThumbnail = (e: React.MouseEvent) => {
        e.stopPropagation();
        setThumbnailPreview(null);
        setData('thumbnail', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newPreviews = files.map((f) => URL.createObjectURL(f));
            setGalleryPreviews((prev) => [...prev, ...newPreviews]);
            setData('gallery_images', [...data.gallery_images, ...files]);
        }
    };
    const removeGalleryImage = (index: number) => {
        const newPreviews = [...galleryPreviews];
        newPreviews.splice(index, 1);
        setGalleryPreviews(newPreviews);
        const newImages = [...data.gallery_images];
        newImages.splice(index, 1);
        setData('gallery_images', newImages);
    };

    // --- 4. HANDLERS (LỊCH TRÌNH) ---
    const addSchedule = () => {
        if (!data.province_id) {
            toast.error('Vui lòng chọn Tỉnh/Thành phố ở phần trên trước.');
            return;
        }
        // Đã bỏ logic kiểm tra số ngày tại đây
        setData('schedules', [
            ...data.schedules,
            {
                name: '',
                description: '',
                destination_id: '',
                date: data.schedules.length + 1,
                breakfast: false,
                lunch: true,
                dinner: true,
            },
        ]);
    };
    const removeSchedule = (index: number) => {
        const newSchedules = [...data.schedules];
        newSchedules.splice(index, 1);
        setData('schedules', newSchedules);
    };
    const updateSchedule = (
        index: number,
        field: keyof TempSchedule,
        value: any,
    ) => {
        const newSchedules = [...data.schedules];
        newSchedules[index] = { ...newSchedules[index], [field]: value };
        setData('schedules', newSchedules);
    };

    // --- 5. HANDLERS (SERVICES) ---
    const addTourService = () => {
        if (!data.province_id) {
            toast.error('Vui lòng chọn Tỉnh/Thành phố trước khi thêm dịch vụ.');
            return;
        }
        setData('tour_services', [
            ...data.tour_services,
            {
                service_id: '',
                quantity: 1,
                unit: 'Lần',
                price_unit: 0,
                price_total: 0,
                description: '',
            },
        ]);
    };
    const removeTourService = (index: number) => {
        const newServices = [...data.tour_services];
        newServices.splice(index, 1);
        setData('tour_services', newServices);
    };
    const updateTourService = (
        index: number,
        field: keyof TempTourService,
        value: any,
    ) => {
        const newServices = [...data.tour_services];
        const currentItem = { ...newServices[index] };
        currentItem[field] = value;

        if (field === 'service_id') {
            const selectedService = availableServices.find(
                (s) => String(s.id) === value,
            );
            if (selectedService) {
                currentItem.price_unit = Number(selectedService.price);
                currentItem.unit = selectedService.unit || 'Lần';
                currentItem.service_name = selectedService.name;
                currentItem.price_total =
                    currentItem.quantity * currentItem.price_unit;
            }
        }
        if (field === 'quantity' || field === 'price_unit') {
            const qty =
                field === 'quantity' ? Number(value) : currentItem.quantity;
            const price =
                field === 'price_unit' ? Number(value) : currentItem.price_unit;
            currentItem.price_total = qty * price;
        }
        newServices[index] = currentItem;
        setData('tour_services', newServices);
    };

    const toggleSelection = (field: 'policy_ids' | 'guide_ids', id: number) => {
        const currentIds = data[field];
        if (currentIds.includes(id)) {
            setData(
                field,
                currentIds.filter((item) => item !== id),
            );
        } else {
            setData(field, [...currentIds, id]);
        }
    };

    // --- VALIDATION STATE ---
    const nightWarning = useMemo(() => {
        const day = Number(data.day);
        const night = Number(data.night);
        if (night > day) {
            return 'Số đêm không được lớn hơn số ngày.';
        }
        if (day - night > 1) {
            return 'Số đêm không được ít hơn số ngày quá 1 (chênh tối đa 1).';
        }
        return '';
    }, [data.night, data.day]);

    const scheduleWarning = useMemo(() => {
        return Number(data.day) > 0 && data.schedules.length !== Number(data.day)
            ? `Cần ${data.day} ngày lịch trình, hiện có ${data.schedules.length}.`
            : '';
    }, [data.day, data.schedules.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate số đêm không vượt quá số ngày
        if (nightWarning) {
            toast.error(nightWarning);
            return;
        }

        // Validate lịch trình phải khớp số ngày (ít nhất = số ngày)
        if (scheduleWarning) {
            toast.error(scheduleWarning);
            return;
        }

        post(tourUrl.store().url, {
            forceFormData: true,
            onSuccess: (page) => {
                // Sau khi tạo template thành công, redirect đến trang tạo instance
                const tourId = (page.props as any).tour?.id || (page.props as any).template?.id;
                if (tourId) {
                    router.visit(`/tours/${tourId}/instances/create`);
                } else {
                    router.visit(tourUrl.index().url);
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Tạo Tour Mới', href: '#' }]}>
            <Head title="Tạo Tour Mới" />
            <div className="min-h-screen bg-gray-50 p-8 pb-24">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto max-w-7xl space-y-8"
                >
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Tạo Tour Mới
                        </h1>
                        <p className="text-sm text-gray-500">
                            Điền thông tin chung của Tour. Các chuyến đi cụ thể (ngày khởi hành, giá, hướng dẫn viên) sẽ tạo ở bước tiếp theo.
                        </p>
                    </div>
                    {/* CARD 1: THÔNG TIN CƠ BẢN (Đã chuyển lên đầu) */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">
                            1. Thông tin cơ bản
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label>
                                        Danh mục{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(v) =>
                                            setData('category_id', v)
                                        }
                                        value={data.category_id}
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.category_id
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        >
                                            <SelectValue placeholder="-- Chọn danh mục --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={String(c.id)}
                                                >
                                                    {c.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.category_id}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>
                                        Tên Tour{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="VD: Tour Khám Phá..."
                                        className={
                                            errors.title ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* Các field instance (date_start, price, limit, status) đã được chuyển sang TourInstances/Create.tsx */}
                        </div>
                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label>Số ngày</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.day}
                                    onChange={(e) =>
                                        setData('day', Number(e.target.value))
                                    }
                                />
                            </div>
                            <div>
                                <Label>Số đêm</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={data.night}
                                    onChange={(e) =>
                                        setData('night', Number(e.target.value))
                                    }
                                />
                                    {nightWarning && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {nightWarning}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: ĐỊA ĐIỂM & LỊCH TRÌNH */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">
                            2. Địa điểm & Lịch trình
                        </h2>

                        {/* PANEL 3 CỘT */}
                        <div className="mb-8">
                            <Label className="mb-2 block text-base font-semibold text-blue-700">
                                Chọn Địa điểm để tạo lịch trình tự động
                            </Label>
                            <div className="grid h-[450px] grid-cols-1 overflow-hidden rounded-lg border bg-white shadow-sm md:grid-cols-3">
                                {/* CỘT 1: QUỐC GIA */}
                                <div className="flex flex-col border-r">
                                    <div className="flex items-center gap-2 border-b bg-gray-50 p-3 font-semibold text-gray-700">
                                        <MapPin className="h-4 w-4" /> Quốc gia
                                    </div>
                                    <div className="border-b p-2">
                                        <div className="relative">
                                            <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Tìm quốc gia..."
                                                className="h-9 pl-8"
                                                value={searchCountry}
                                                onChange={(e) =>
                                                    setSearchCountry(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="scrollbar-thin scrollbar-thumb-gray-200 flex-1 space-y-1 overflow-y-auto p-2">
                                        {filteredCountries.map((country) => (
                                            <button
                                                key={country.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectCountry(
                                                        String(country.id),
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${String(country.id) === selectedCountryId ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                <span>{country.name}</span>
                                                {String(country.id) ===
                                                    selectedCountryId && (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* CỘT 2: TỈNH THÀNH */}
                                <div className="flex flex-col border-r">
                                    <div className="border-b bg-gray-50 p-3 font-semibold text-gray-700">
                                        Tỉnh / Thành phố
                                    </div>
                                    <div className="border-b p-2">
                                        <div className="relative">
                                            <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                            <Input
                                                placeholder="Tìm tỉnh thành..."
                                                className="h-9 pl-8"
                                                value={searchProvince}
                                                onChange={(e) =>
                                                    setSearchProvince(
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={!selectedCountryId}
                                            />
                                        </div>
                                    </div>
                                    <div className="scrollbar-thin scrollbar-thumb-gray-200 flex-1 space-y-1 overflow-y-auto p-2">
                                        {!selectedCountryId && (
                                            <div className="py-4 text-center text-sm text-gray-400">
                                                ← Chọn quốc gia trước
                                            </div>
                                        )}
                                        {filteredProvinces.map((province) => (
                                            <button
                                                key={province.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectProvince(
                                                        String(province.id),
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${String(province.id) === data.province_id ? 'bg-blue-100 font-medium text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                {province.name}
                                                {String(province.id) ===
                                                    data.province_id && (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* CỘT 3: ĐỊA ĐIỂM */}
                                <div className="flex flex-col bg-gray-50/50">
                                    <div className="border-b bg-gray-50 p-3 font-semibold text-gray-700">
                                        Địa điểm du lịch
                                    </div>
                                    <div className="scrollbar-thin scrollbar-thumb-gray-200 flex-1 space-y-3 overflow-y-auto p-3">
                                        {!data.province_id && (
                                            <div className="py-4 text-center text-sm text-gray-400">
                                                ← Chọn tỉnh thành để xem địa
                                                điểm
                                            </div>
                                        )}
                                        {data.province_id &&
                                            availableDestinations.length ===
                                                0 && (
                                                <div className="py-4 text-center text-sm text-gray-400">
                                                    Chưa có dữ liệu địa điểm
                                                </div>
                                            )}
                                        {availableDestinations.map((dest) => {
                                            const isChecked =
                                                data.schedules.some(
                                                    (s) =>
                                                        s.destination_id ===
                                                        String(dest.id),
                                                );
                                            return (
                                                <div
                                                    key={dest.id}
                                                    className={`flex cursor-pointer items-start space-x-3 rounded-md border p-3 transition-all ${isChecked ? 'border-green-200 bg-green-50' : 'bg-white hover:border-blue-300'}`}
                                                >
                                                    <Checkbox
                                                        id={`dest-${dest.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleToggleDestination(
                                                                dest,
                                                                checked as boolean,
                                                            )
                                                        }
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <label
                                                            htmlFor={`dest-${dest.id}`}
                                                            className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {dest.name}
                                                        </label>
                                                        <p className="line-clamp-2 text-xs text-gray-500">
                                                            {dest.description ||
                                                                'Không có mô tả'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            {/* @ts-ignore */}
                            {errors.province_id && (
                                <p className="mt-2 text-sm text-red-500">
                                    {errors.province_id}
                                </p>
                            )}
                        </div>

                        {/* LIST LỊCH TRÌNH */}
                        <div>
                            <div className="mb-4 flex items-center justify-between border-b pb-2">
                                <Label className="text-base font-semibold text-blue-700">
                                    Lịch trình chi tiết
                                </Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addSchedule}
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Thêm Ngày
                                </Button>
                            </div>
                            <div className="scrollbar-thin max-h-[600px] space-y-4 overflow-y-auto pr-2">
                                {data.schedules.length === 0 && (
                                    <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 text-gray-500">
                                        <p>Chưa có lịch trình nào.</p>
                                    </div>
                                )}
                                {scheduleWarning && (
                                    <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
                                        {scheduleWarning}
                                    </div>
                                )}
                                {data.schedules.map((schedule, index) => (
                                    <div
                                        key={index}
                                        className="relative rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-300 hover:shadow-sm"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSchedule(index)
                                            }
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                            <div className="md:col-span-2">
                                                <Label className="text-xs text-gray-500">
                                                    Ngày
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    className="bg-white"
                                                    value={schedule.date}
                                                    onChange={(e) =>
                                                        updateSchedule(
                                                            index,
                                                            'date',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="md:col-span-6">
                                                <Label className="text-xs text-gray-500">
                                                    Hoạt động
                                                </Label>
                                                <Input
                                                    className="bg-white font-medium"
                                                    placeholder="VD: Tham quan..."
                                                    value={schedule.name}
                                                    onChange={(e) =>
                                                        updateSchedule(
                                                            index,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <Label className="text-xs text-gray-500">
                                                    Địa điểm{' '}
                                                    {selectedProvince
                                                        ? `(${selectedProvince.name})`
                                                        : ''}
                                                </Label>
                                                <Select
                                                    value={String(
                                                        schedule.destination_id,
                                                    )}
                                                    onValueChange={(v) =>
                                                        updateSchedule(
                                                            index,
                                                            'destination_id',
                                                            v,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Chọn điểm đến" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableDestinations.length >
                                                        0 ? (
                                                            availableDestinations.map(
                                                                (d) => (
                                                                    <SelectItem
                                                                        key={
                                                                            d.id
                                                                        }
                                                                        value={String(
                                                                            d.id,
                                                                        )}
                                                                    >
                                                                        {d.name}
                                                                    </SelectItem>
                                                                ),
                                                            )
                                                        ) : (
                                                            <div className="p-2 text-center text-xs text-gray-500">
                                                                Chưa có địa điểm
                                                                nào
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="md:col-span-12">
                                                <Label className="text-xs text-gray-500">
                                                    Chi tiết
                                                </Label>
                                                <Textarea
                                                    className="bg-white"
                                                    rows={2}
                                                    value={schedule.description}
                                                    onChange={(e) =>
                                                        updateSchedule(
                                                            index,
                                                            'description',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            {/* Bữa ăn đã bị xóa */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: MÔ TẢ (Giữ nguyên) */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">
                            3. Nội dung mô tả
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <Label className="mb-2 block font-medium">
                                    Mô tả ngắn (Tóm tắt)
                                </Label>
                                <Textarea
                                    rows={3}
                                    value={data.short_description}
                                    onChange={(e) =>
                                        setData(
                                            'short_description',
                                            e.target.value,
                                        )
                                    }
                                    className={
                                        errors.short_description
                                            ? 'border-red-500'
                                            : ''
                                    }
                                />
                                {errors.short_description && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.short_description}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label className="mb-2 block font-medium">
                                    Mô tả chi tiết
                                </Label>
                                <div
                                    className={`rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <RichTextEditor
                                        value={data.description}
                                        onChange={(content) =>
                                            setData('description', content)
                                        }
                                        height={400}
                                    />
                                </div>
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: HÌNH ẢNH (Giữ nguyên) */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">
                            4. Thư viện hình ảnh
                        </h2>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="md:col-span-1">
                                <Label className="mb-3 block font-medium">
                                    Ảnh đại diện{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div
                                    className={`relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 hover:bg-gray-100 ${errors.thumbnail ? 'border-red-500' : 'border-gray-300'}`}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    {thumbnailPreview ? (
                                        <>
                                            <img
                                                src={thumbnailPreview}
                                                className="h-full w-full rounded-lg object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveThumbnail}
                                                className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <UploadCloud className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                                            <span className="text-sm text-gray-500">
                                                Tải ảnh lên
                                            </span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                    />
                                </div>
                                {errors.thumbnail && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.thumbnail}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label className="mb-3 block font-medium">
                                    Bộ sưu tập ảnh
                                </Label>
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="mb-4 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 hover:bg-gray-100">
                                        <label className="cursor-pointer text-center">
                                            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">
                                                Thêm nhiều ảnh
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleGalleryChange}
                                            />
                                        </label>
                                    </div>
                                    {galleryPreviews.length > 0 && (
                                        <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6">
                                            {galleryPreviews.map((src, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group relative aspect-square overflow-hidden rounded-md border"
                                                >
                                                    <img
                                                        src={src}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeGalleryImage(
                                                                idx,
                                                            )
                                                        }
                                                        className="absolute top-1 right-1 hidden rounded-full bg-red-600 p-0.5 text-white shadow-sm group-hover:block"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 5: DỊCH VỤ & KHÁC */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:col-span-3">
                            <div className="mb-4 flex items-center justify-between border-b pb-2">
                                <h3 className="text-lg font-bold text-gray-800">
                                    5. Dịch vụ đi kèm
                                </h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={addTourService}
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Thêm Dịch
                                    vụ
                                </Button>
                            </div>
                            {!data.province_id && (
                                <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
                                    Vui lòng chọn{' '}
                                    <strong>Tỉnh/Thành phố</strong> để hiển thị
                                    danh sách nhà cung cấp dịch vụ.
                                </div>
                            )}
                            <div className="scrollbar-thin max-h-[600px] space-y-4 overflow-y-auto pr-2">
                                {data.tour_services.map((item, index) => (
                                    <div
                                        key={index}
                                        className="relative flex flex-col gap-4 rounded-lg border bg-gray-50 p-4 hover:border-blue-300 md:flex-row md:items-start"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeTourService(index)
                                            }
                                            className="absolute -top-2 -right-2 rounded-full border bg-white p-1 text-red-500 shadow-sm hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="flex-1">
                                            <Label className="text-xs text-gray-500">
                                                Tên dịch vụ
                                            </Label>
                                            <Select
                                                value={item.service_id}
                                                onValueChange={(v) =>
                                                    updateTourService(
                                                        index,
                                                        'service_id',
                                                        v,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1 bg-white">
                                                    <SelectValue placeholder="Chọn dịch vụ..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableServices.length >
                                                    0 ? (
                                                        availableServices.map(
                                                            (s) => (
                                                                <SelectItem
                                                                    key={s.id}
                                                                    value={String(
                                                                        s.id,
                                                                    )}
                                                                >
                                                                    {/* @ts-ignore */}
                                                                    {
                                                                        s.displayName
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )
                                                    ) : (
                                                        <div className="p-2 text-center text-xs text-gray-500">
                                                            Không có dịch vụ nào
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-24">
                                            <Label className="text-xs text-gray-500">
                                                SL
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                className="mt-1 bg-white"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateTourService(
                                                        index,
                                                        'quantity',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="w-24">
                                            <Label className="text-xs text-gray-500">
                                                Đơn vị
                                            </Label>
                                            <Input
                                                className="mt-1 bg-white"
                                                value={item.unit}
                                                onChange={(e) =>
                                                    updateTourService(
                                                        index,
                                                        'unit',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Label className="text-xs text-gray-500">
                                                Đơn giá
                                            </Label>
                                            <Input
                                                type="number"
                                                className="mt-1 bg-white"
                                                value={item.price_unit}
                                                onChange={(e) =>
                                                    updateTourService(
                                                        index,
                                                        'price_unit',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Label className="text-xs text-gray-500">
                                                Thành tiền
                                            </Label>
                                            <div className="mt-1 flex h-10 items-center rounded-md border bg-gray-100 px-3 font-bold text-green-600">
                                                $
                                                {item.price_total.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 font-semibold text-gray-800">
                                Chính sách
                            </h3>
                            <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
                                {policies.map((p) => (
                                    <label
                                        key={p.id}
                                        className="flex cursor-pointer items-start gap-2 rounded border p-2 hover:bg-gray-50"
                                    >
                                        <Checkbox
                                            className="mt-0.5"
                                            checked={data.policy_ids.includes(
                                                p.id,
                                            )}
                                            onCheckedChange={() =>
                                                toggleSelection(
                                                    'policy_ids',
                                                    p.id,
                                                )
                                            }
                                        />
                                        <span className="text-sm text-gray-700">
                                            {p.title}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Hướng dẫn viên */}
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Hướng dẫn viên
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Chọn hướng dẫn viên cho tour này. Các hướng dẫn viên này sẽ được tự động gán cho các chuyến đi mới.
                            </p>
                            <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3">
                                {guides.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Chưa có hướng dẫn viên nào trong hệ thống.
                                    </p>
                                ) : (
                                    guides.map((guide) => (
                                        <div
                                            key={guide.id}
                                            className={`flex items-center justify-between rounded-md border p-3 ${
                                                guide.has_active_tour
                                                    ? 'border-amber-200 bg-amber-50'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`guide-${guide.id}`}
                                                    checked={data.guide_ids.includes(
                                                        guide.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelection(
                                                            'guide_ids',
                                                            guide.id,
                                                        )
                                                    }
                                                    disabled={
                                                        guide.has_active_tour
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`guide-${guide.id}`}
                                                    className={`cursor-pointer ${
                                                        guide.has_active_tour
                                                            ? 'text-gray-400'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    {guide.name} ({guide.email})
                                                </Label>
                                            </div>
                                            {guide.has_active_tour && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-amber-100 text-amber-800"
                                                >
                                                    Đã có tour
                                                </Badge>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* FOOTER SUBMIT */}
                    <div className="flex justify-end gap-4 border-t bg-white/95 p-4 shadow-sm">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => window.history.back()}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            size="lg"
                            className="min-w-[200px] bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? 'Đang tạo...' : 'Tạo Tour Template'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
