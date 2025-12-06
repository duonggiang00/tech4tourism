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
import { Category, Country, Destination, Policy, Tour, User } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Check,
    MapPin,
    Plus,
    Save,
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

// Props nhận từ Controller (Hàm edit)
interface EditProps {
    tour: Tour; // Dữ liệu Tour/Template cần sửa
    template?: Tour & { instances?: any[] }; // TourTemplate với instances (nếu có)
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
    // Đã bỏ bữa ăn theo yêu cầu cũ
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

export default function Edit({
    tour,
    template,
    categories,
    policies,
    guides,
    countries,
}: EditProps) {
    // Sử dụng template nếu có, nếu không dùng tour
    const tourData = template || tour;
    const instances = (template as any)?.instances || [];

    // --- 1. SETUP FORM (LOAD DỮ LIỆU CŨ) ---
    // Loại bỏ các field instance: date_start, limit, status
    // Giữ lại price_adult và price_children cho template (giá mặc định)
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // Quan trọng để Laravel hiểu đây là Update khi có File Upload
        category_id: String(tourData.category_id),
        province_id: String(tourData.province_id || ''), // Load tỉnh cũ
        title: tourData.title,
        day: tourData.day,
        night: tourData.night,

        // Ảnh: Thumbnail là File mới (nếu upload) hoặc null (nếu giữ nguyên)
        thumbnail: null as File | null,

        description: tourData.description || '',
        short_description: tourData.short_description || '',
        price_adult: (tourData as any).price_adult ?? '',
        price_children: (tourData as any).price_children ?? '',

        // Gallery: Chỉ chứa ảnh MỚI upload thêm
        gallery_images: [] as File[],

        // Map dữ liệu quan hệ cũ sang cấu trúc form
        schedules: ((tourData as any).schedules || []).map((s: any) => ({
            name: s.name,
            description: s.description || '',
            destination_id: String(s.destination_id),
            date: s.date,
        })) as TempSchedule[],

        tour_services: ((tourData as any).tour_services || []).map((s: any) => ({
            service_id: String(s.service_id),
            service_name: s.service?.name, // Optional: để hiển thị nếu cần
            quantity: s.quantity,
            unit: s.unit,
            price_unit: s.price_unit,
            price_total: s.price_total,
            description: s.description || '',
        })) as TempTourService[],

        policy_ids: ((tourData as any).tour_policies || []).map((p: any) => p.policy_id),
        guide_ids: ((tourData as any).trip_assignments || []).filter((a: any) => !a.tour_instance_id).map((a: any) => a.user_id) || [],
    });

    // --- TỰ ĐỘNG TÌM QUỐC GIA CỦA TỈNH HIỆN TẠI ---
    const initialCountryId = useMemo(() => {
        if (!tourData.province_id) return '';
        const country = countries.find((c) =>
            c.provinces?.some((p) => String(p.id) === String(tourData.province_id)),
        );
        return country ? String(country.id) : '';
    }, [tourData.province_id, countries]);

    // --- STATE CHO LOCATION PANEL ---
    const [selectedCountryId, setSelectedCountryId] =
        useState<string>(initialCountryId);
    const [searchCountry, setSearchCountry] = useState('');
    const [searchProvince, setSearchProvince] = useState('');

    // --- 2. LOGIC LỌC DỮ LIỆU ---
    const filteredCountries = useMemo(() => {
        return countries.filter((c) =>
            c.name.toLowerCase().includes(searchCountry.toLowerCase()),
        );
    }, [countries, searchCountry]);

    const filteredProvinces = useMemo(() => {
        const country = countries.find(
            (c) => String(c.id) === selectedCountryId,
        );
        const provinces = country?.provinces || [];
        return provinces.filter((p) =>
            p.name.toLowerCase().includes(searchProvince.toLowerCase()),
        );
    }, [countries, selectedCountryId, searchProvince]);

    const selectedProvince = useMemo(() => {
        for (const country of countries) {
            const found = country.provinces?.find(
                (p) => String(p.id) === data.province_id,
            );
            if (found) return found;
        }
        return null;
    }, [data.province_id, countries]);

    const availableDestinations = useMemo(() => {
        return selectedProvince?.destinations || [];
    }, [selectedProvince]);

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
        // Khi đổi quốc gia ở màn Edit, ta cũng reset tỉnh như màn Create
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
            const newSchedule: TempSchedule = {
                name: `Tham quan ${dest.name}`,
                description: dest.description || `Khám phá ${dest.name}`,
                destination_id: String(dest.id),
                date: data.schedules.length + 1,
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
    // Khởi tạo preview với ảnh cũ từ server (giả sử tour.thumbnail là URL đầy đủ hoặc path)
    // Lưu ý: Bạn cần xử lý URL ảnh cho đúng (ví dụ thêm /storage/...) nếu backend trả về path relative
    const initialThumbnailUrl =
        tour.thumbnail && !tour.thumbnail.startsWith('http')
            ? `/storage/${tour.thumbnail}`
            : tour.thumbnail;

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        initialThumbnailUrl || null,
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
        setData('thumbnail', null); // Gửi null lên server để biết là xóa (hoặc giữ nguyên tùy logic BE)
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

    // --- 4. HANDLERS (LỊCH TRÌNH & DỊCH VỤ - GIỮ NGUYÊN NHƯ CREATE) ---
    const addSchedule = () => {
        if (!data.province_id) {
            toast.error('Vui lòng chọn Tỉnh/Thành phố ở phần trên trước.');
            return;
        }
        setData('schedules', [
            ...data.schedules,
            {
                name: '',
                description: '',
                destination_id: '',
                date: data.schedules.length + 1,
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Sử dụng post nhưng trỏ vào route update (đã có _method: PUT trong data)
        post(tourUrl.update(tourData.id).url, {
            forceFormData: true,
            onError: (err) => {
                console.error('Validation Errors:', err);
                toast.error('Có lỗi xảy ra. Vui lòng kiểm tra lại dữ liệu.');
                const firstErrorKey = Object.keys(err)[0];
                if (firstErrorKey) toast.error(err[firstErrorKey]);
            },
            onSuccess: () => {
                toast.success('Cập nhật tour thành công!');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Chỉnh sửa Tour', href: '#' }]}>
            <Head title={`Chỉnh sửa: ${tourData.title}`} />
            <div className="min-h-screen bg-gray-50 p-8 pb-24">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto max-w-7xl space-y-8"
                >
                    {/* CARD 1: THÔNG TIN CƠ BẢN */}
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
                            {/* Các field instance (status, price, date_start, limit) đã được chuyển sang quản lý ở TourInstances */}
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
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label>
                                    Giá người lớn (VND){' '}
                                    <span className="text-gray-500 text-xs">(Giá mặc định)</span>
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={data.price_adult}
                                    onChange={(e) =>
                                        setData('price_adult', e.target.value ? Number(e.target.value) : '')
                                    }
                                    placeholder="VD: 5000000"
                                />
                                {errors.price_adult && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.price_adult}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Giá trẻ em (VND){' '}
                                    <span className="text-gray-500 text-xs">(Giá mặc định)</span>
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={data.price_children}
                                    onChange={(e) =>
                                        setData('price_children', e.target.value ? Number(e.target.value) : '')
                                    }
                                    placeholder="VD: 3000000"
                                />
                                {errors.price_children && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.price_children}
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
                        <div className="mb-8">
                            <Label className="mb-2 block text-base font-semibold text-blue-700">
                                Chỉnh sửa Địa điểm (Lưu ý: Chọn lại tỉnh sẽ
                                reset lịch trình)
                            </Label>
                            <div className="grid h-[450px] grid-cols-1 overflow-hidden rounded-lg border bg-white shadow-sm md:grid-cols-3">
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
                                                            className="cursor-pointer text-sm leading-none font-medium"
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: MÔ TẢ */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">
                            3. Nội dung mô tả
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <Label className="mb-2 block font-medium">
                                    Mô tả ngắn
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
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block font-medium">
                                    Mô tả chi tiết
                                </Label>
                                <div
                                    className={`rounded-md border border-gray-300`}
                                >
                                    <RichTextEditor
                                        value={data.description}
                                        onChange={(content) =>
                                            setData('description', content)
                                        }
                                        height={400}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: HÌNH ẢNH */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">
                            4. Thư viện hình ảnh
                        </h2>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="md:col-span-1">
                                <Label className="mb-3 block font-medium">
                                    Ảnh đại diện
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
                                    Thêm ảnh mới vào Gallery
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
                                {tour.images && tour.images.length > 0 && (
                                    <div className="mt-4">
                                        <Label className="mb-2 block text-sm font-medium text-gray-700">
                                            Ảnh hiện tại (Chỉ xem)
                                        </Label>
                                        <div className="grid grid-cols-6 gap-2">
                                            {tour.images.map((img) => (
                                                <div
                                                    key={img.id}
                                                    className="relative aspect-square overflow-hidden rounded border"
                                                >
                                                    <img
                                                        src={
                                                            img.img_url.startsWith(
                                                                'http',
                                                            )
                                                                ? img.img_url
                                                                : `/storage/${img.img_url}`
                                                        }
                                                        className="h-full w-full object-cover"
                                                        alt={img.alt}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                        {/* Phân công HDV sẽ được thực hiện khi tạo/cập nhật TourInstance */}
                        {instances.length > 0 && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-6 shadow-sm md:col-span-2">
                                <h3 className="mb-2 font-semibold text-blue-800">
                                    Quản lý Chuyến Đi
                                </h3>
                                <p className="mb-4 text-sm text-blue-700">
                                    Tour này có {instances.length} chuyến đi. Bạn có thể quản lý từng chuyến đi (ngày khởi hành, giá, số chỗ, hướng dẫn viên) ở trang chi tiết tour.
                                </p>
                                <Link href={tourUrl.show(tourData.id).url}>
                                    <Button variant="outline" size="sm">
                                        Xem chi tiết và quản lý chuyến đi
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {instances.length === 0 && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-6 shadow-sm md:col-span-2">
                                <h3 className="mb-2 font-semibold text-amber-800">
                                    Chưa có Chuyến Đi
                                </h3>
                                <p className="text-sm text-amber-700">
                                    Sau khi cập nhật Tour Template, bạn có thể tạo các chuyến đi cụ thể (với ngày khởi hành, giá, số chỗ, hướng dẫn viên) từ trang chi tiết tour.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="sticky bottom-0 z-20 flex justify-end gap-4 border-t bg-white/95 p-4 shadow-lg backdrop-blur">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => window.history.back()}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            size="lg"
                            className="min-w-[200px] bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? (
                                'Đang xử lý...'
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-4 w-4" /> Cập Nhật Tour
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
