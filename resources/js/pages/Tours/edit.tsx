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
import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
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
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Interface cho Guide
interface GuideWithStatus extends User {
    has_active_tour?: boolean;
}

// Props nhận từ Controller
interface EditProps {
    tour: Tour;
    template?: Tour & { instances?: any[] };
    categories: Category[];
    policies: Policy[];
    guides: GuideWithStatus[];
    countries: Country[];
}

// Kiểu dữ liệu cho Lịch trình
interface TempSchedule {
    name: string;
    description: string;
    destination_id: string;
    date: number;
}

// Kiểu dữ liệu cho Tour Service
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
    const tourData = template || tour;
    const instances = (template as any)?.instances || [];

    // --- 1. SETUP FORM ---
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        category_id: String(tourData.category_id),
        province_id: String(tourData.province_id || ''),
        title: tourData.title,
        day: tourData.day,
        night: tourData.night,

        thumbnail: null as File | null,
        description: tourData.description || '',
        short_description: tourData.short_description || '',
        price_adult: (tourData as any).price_adult ?? '',
        price_children: (tourData as any).price_children ?? '',

        gallery_images: [] as File[],

        schedules: ((tourData as any).schedules || []).map((s: any) => ({
            name: s.name,
            description: s.description || '',
            destination_id: String(s.destination_id),
            date: s.date,
        })) as TempSchedule[],

        tour_services: ((tourData as any).tour_services || []).map((s: any) => ({
            service_id: String(s.service_id),
            service_name: s.service?.name,
            quantity: s.quantity,
            unit: s.unit,
            price_unit: s.price_unit,
            price_total: s.price_total,
            description: s.description || '',
        })) as TempTourService[],

        policy_ids: ((tourData as any).tour_policies || []).map((p: any) => p.policy_id),
        guide_ids: ((tourData as any).trip_assignments || []).filter((a: any) => !a.tour_instance_id).map((a: any) => a.user_id) || [],

        pricing_config: (tourData as any).pricing_config || null,
    });

    // --- AUTOMATIC COUNTRY DETECTION ---
    const initialCountryId = useMemo(() => {
        if (!tourData.province_id) return '';
        const country = countries.find((c) =>
            c.provinces?.some((p) => String(p.id) === String(tourData.province_id)),
        );
        return country ? String(country.id) : '';
    }, [tourData.province_id, countries]);

    // --- LOCAL STATE ---
    const [selectedCountryId, setSelectedCountryId] = useState<string>(initialCountryId);
    const [searchCountry, setSearchCountry] = useState('');
    const [searchProvince, setSearchProvince] = useState('');

    // --- WIZARD STATE ---
    const [currentStep, setCurrentStep] = useState(1);
    const [canSubmit, setCanSubmit] = useState(true);
    const steps = [
        { id: 1, title: 'Thông tin chung' },
        { id: 2, title: 'Lịch trình' },
        { id: 3, title: 'Nội dung' },
        { id: 4, title: 'Hình ảnh' },
        { id: 5, title: 'Dịch vụ & Khác' },
        { id: 6, title: 'Tính giá & LN' },
    ];

    // --- PRICING BUILDER STATE ---
    const [pricingConfig, setPricingConfig] = useState((tourData as any).pricing_config || {
        guestEstimate: 10,
        guideSalaryDay: 500000,
        insurancePerPax: 20000,
        managementFee: 0,
        profitMargin: 20,
        taxRate: 8,
        childrenPercentage: 75,
    });

    // --- FILTER LOGIC ---
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

    // --- PRICING CALCULATIONS ---
    const calculatedPrices = useMemo(() => {
        const totalServiceCost = data.tour_services.reduce((sum, item) => sum + item.price_total, 0);
        const serviceCostPerPax = Math.ceil(totalServiceCost / pricingConfig.guestEstimate);
        const guideCostPerPax = Math.ceil((pricingConfig.guideSalaryDay * data.day) / pricingConfig.guestEstimate);
        const baseCost = serviceCostPerPax + guideCostPerPax + pricingConfig.insurancePerPax;
        const costWithMgmt = baseCost + pricingConfig.managementFee;
        const priceBeforeTax = costWithMgmt * (1 + (pricingConfig.profitMargin / 100));
        const finalPrice = Math.ceil(priceBeforeTax * (1 + (pricingConfig.taxRate / 100)));
        const roundedPrice = Math.ceil(finalPrice / 1000) * 1000;

        return {
            totalServiceCost,
            serviceCostPerPax,
            guideCostPerPax,
            baseCost,
            costWithMgmt,
            priceBeforeTax,
            finalPrice: roundedPrice
        };
    }, [data.tour_services, data.day, pricingConfig]);

    const applyCalculatedPrice = () => {
        setData(d => ({
            ...d,
            price_adult: calculatedPrices.finalPrice,
            price_children: Math.ceil(calculatedPrices.finalPrice * (pricingConfig.childrenPercentage / 100) / 1000) * 1000,
            pricing_config: pricingConfig
        }));
        toast.success('Đã áp dụng giá tính toán vào form!');
    };

    // --- VALIDATIONS ---
    const nightWarning = useMemo(() => {
        const day = Number(data.day);
        const night = Number(data.night);
        if (night > day) return 'Số đêm không được lớn hơn số ngày.';
        if (day - night > 1) return 'Số đêm không được ít hơn số ngày quá 1 (chênh tối đa 1).';
        return '';
    }, [data.night, data.day]);

    const scheduleWarning = useMemo(() => {
        return Number(data.day) > 0 && data.schedules.length !== Number(data.day)
            ? `Cần ${data.day} ngày lịch trình, hiện có ${data.schedules.length}.`
            : '';
    }, [data.day, data.schedules.length]);

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                if (!data.category_id) return 'Vui lòng chọn danh mục';
                if (!data.title) return 'Vui lòng nhập tên tour';
                if (Number(data.day) < 1) return 'Số ngày phải lớn hơn 0';
                if (nightWarning) return nightWarning;
                return true;
            case 2:
                if (!data.province_id) return 'Vui lòng chọn Tỉnh/Thành phố';
                if (scheduleWarning) return scheduleWarning;
                return true;
            case 3:
                if (!data.short_description) return 'Vui lòng nhập mô tả ngắn';
                return true;
            case 4:
                return true;
            case 5:
                return true;
            case 6:
                if (!data.price_adult) return 'Vui lòng nhập giá người lớn';
                return true;
            default:
                return true;
        }
    };

    // --- NAVIGATION HANDLERS ---
    const handleNext = () => {
        const validation = validateStep(currentStep);
        if (validation === true) {
            setCurrentStep(prev => Math.min(prev + 1, 6));
            window.scrollTo(0, 0);
            if (currentStep === 5) {
                setCanSubmit(false);
                setTimeout(() => setCanSubmit(true), 1000);
            }
        } else {
            toast.error(validation as string);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    // --- FORM HANDLERS ---
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

    const handleDayChange = (val: string) => {
        const newDay = Number(val);
        setData(prev => {
            const currentSchedules = [...prev.schedules];
            if (newDay > currentSchedules.length) {
                for (let i = currentSchedules.length; i < newDay; i++) {
                    currentSchedules.push({
                        name: `Ngày ${i + 1}: `,
                        description: '',
                        destination_id: '',
                        date: i + 1,
                    });
                }
            } else if (newDay < currentSchedules.length) {
                currentSchedules.length = newDay > 0 ? newDay : 0;
            }
            return {
                ...prev,
                day: newDay,
                schedules: currentSchedules
            };
        });
    };

    // --- IMAGE HANDLERS ---
    const initialThumbnailUrl = tour.thumbnail && !tour.thumbnail.startsWith('http')
        ? `/storage/${tour.thumbnail}` : tour.thumbnail;
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialThumbnailUrl || null);
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

    // --- SERVICES & SCHEDULES HANDLERS ---
    const addSchedule = () => {
        if (!data.province_id) {
            toast.error('Vui lòng chọn Tỉnh/Thành phố ở phần trên trước.');
            return;
        }
        setData('schedules', [
            ...data.schedules,
            { name: '', description: '', destination_id: '', date: data.schedules.length + 1 },
        ]);
    };
    const removeSchedule = (index: number) => {
        const newSchedules = [...data.schedules];
        newSchedules.splice(index, 1);
        setData('schedules', newSchedules);
    };
    const updateSchedule = (index: number, field: keyof TempSchedule, value: any) => {
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
            { service_id: '', quantity: 1, unit: 'Lần', price_unit: 0, price_total: 0, description: '' },
        ]);
    };
    const removeTourService = (index: number) => {
        const newServices = [...data.tour_services];
        newServices.splice(index, 1);
        setData('tour_services', newServices);
    };
    const updateTourService = (index: number, field: keyof TempTourService, value: any) => {
        const newServices = [...data.tour_services];
        const currentItem = { ...newServices[index] };
        (currentItem as any)[field] = value;

        if (field === 'service_id') {
            const selectedService = availableServices.find((s) => String(s.id) === value);
            if (selectedService) {
                currentItem.price_unit = Number(selectedService.price);
                currentItem.unit = selectedService.unit || 'Lần';
                currentItem.service_name = selectedService.name;
                currentItem.price_total = currentItem.quantity * currentItem.price_unit;
            }
        }
        if (field === 'quantity' || field === 'price_unit') {
            const qty = field === 'quantity' ? Number(value) : currentItem.quantity;
            const price = field === 'price_unit' ? Number(value) : currentItem.price_unit;
            currentItem.price_total = qty * price;
        }
        newServices[index] = currentItem;
        setData('tour_services', newServices);
    };

    const toggleSelection = (field: 'policy_ids' | 'guide_ids', id: number) => {
        const currentIds = data[field];
        if (currentIds.includes(id)) {
            setData(field, currentIds.filter((item) => item !== id));
        } else {
            setData(field, [...currentIds, id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure configuration is saved
        data.pricing_config = pricingConfig;

        if (currentStep < 6) {
            handleNext();
            return;
        }

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
            <div className="min-h-screen bg-gray-50 p-8 pb-32">
                <form onSubmit={handleSubmit} className="mx-auto max-w-7xl space-y-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chỉnh sửa Tour
                            </h1>
                            <div className="text-sm font-medium text-gray-500">
                                Bước {currentStep}/6
                            </div>
                        </div>

                        {/* STEPS INDICATOR */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
                            {steps.map((step) => (
                                <div key={step.id} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                    ${step.id === currentStep ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                        step.id < currentStep ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                                        ${step.id === currentStep ? 'bg-blue-600 text-white' : step.id < currentStep ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                                        {step.id}
                                    </div>
                                    {step.title}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CARD 1: THÔNG TIN CƠ BẢN */}
                    <div className={currentStep === 1 ? 'block' : 'hidden'}>
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">
                                1. Thông tin cơ bản
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <Label>Danh mục <span className="text-red-500">*</span></Label>
                                        <Select onValueChange={(v) => setData('category_id', v)} value={data.category_id}>
                                            <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="-- Chọn danh mục --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
                                    </div>
                                    <div>
                                        <Label>Tên Tour <span className="text-red-500">*</span></Label>
                                        <Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="VD: Tour Khám Phá..." className={errors.title ? 'border-red-500' : ''} />
                                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Label>Số ngày</Label>
                                    <Input type="number" min="1" value={data.day} onChange={(e) => handleDayChange(e.target.value)} onFocus={(e) => e.target.select()} />
                                </div>
                                <div>
                                    <Label>Số đêm</Label>
                                    <Input type="number" min="0" value={data.night} onChange={(e) => setData('night', Number(e.target.value))} onFocus={(e) => e.target.select()} />
                                    {nightWarning && <p className="mt-1 text-xs text-red-500">{nightWarning}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: ĐỊA ĐIỂM & LỊCH TRÌNH */}
                    <div className={currentStep === 2 ? 'block' : 'hidden'}>
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">2. Địa điểm & Lịch trình</h2>
                            <div className="mb-8">
                                <Label className="mb-2 block text-base font-semibold text-blue-700">Chỉnh sửa Địa điểm (Lưu ý: Chọn lại tỉnh sẽ reset lịch trình)</Label>
                                <div className="grid h-[450px] grid-cols-1 overflow-hidden rounded-lg border bg-white shadow-sm md:grid-cols-3">
                                    <div className="flex flex-col border-r">
                                        <div className="flex items-center gap-2 border-b bg-gray-50 p-3 font-semibold text-gray-700"><MapPin className="h-4 w-4" /> Quốc gia</div>
                                        <div className="border-b p-2">
                                            <div className="relative">
                                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                                <Input placeholder="Tìm quốc gia..." className="h-9 pl-8" value={searchCountry} onChange={(e) => setSearchCountry(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="scrollbar-thin scrollbar-thumb-gray-200 flex-1 space-y-1 overflow-y-auto p-2">
                                            {filteredCountries.map((country) => (
                                                <button key={country.id} type="button" onClick={() => handleSelectCountry(String(country.id))}
                                                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${String(country.id) === selectedCountryId ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                                                    <span>{country.name}</span>
                                                    {String(country.id) === selectedCountryId && <Check className="h-4 w-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col border-r">
                                        <div className="border-b bg-gray-50 p-3 font-semibold text-gray-700">Tỉnh / Thành phố</div>
                                        <div className="border-b p-2">
                                            <div className="relative">
                                                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                                <Input placeholder="Tìm tỉnh thành..." className="h-9 pl-8" value={searchProvince} onChange={(e) => setSearchProvince(e.target.value)} disabled={!selectedCountryId} />
                                            </div>
                                        </div>
                                        <div className="scrollbar-thin scrollbar-thumb-gray-200 flex-1 space-y-1 overflow-y-auto p-2">
                                            {!selectedCountryId && <div className="py-4 text-center text-sm text-gray-400">← Chọn quốc gia trước</div>}
                                            {filteredProvinces.map((province) => (
                                                <button key={province.id} type="button" onClick={() => handleSelectProvince(String(province.id))}
                                                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${String(province.id) === data.province_id ? 'bg-blue-100 font-medium text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                                                    {province.name}
                                                    {String(province.id) === data.province_id && <Check className="h-4 w-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col bg-gray-50/50">
                                        <div className="border-b bg-gray-50 p-3 font-semibold text-gray-700">Địa điểm du lịch</div>
                                        <div className="scrollbar-thin scrollbar-thumb-gray-200 flex-1 space-y-3 overflow-y-auto p-3">
                                            {!data.province_id && <div className="py-4 text-center text-sm text-gray-400">← Chọn tỉnh thành để xem địa điểm</div>}
                                            {data.province_id && availableDestinations.length === 0 && <div className="py-4 text-center text-sm text-gray-400">Chưa có dữ liệu địa điểm</div>}
                                            {availableDestinations.map((dest) => {
                                                const isChecked = data.schedules.some((s) => s.destination_id === String(dest.id));
                                                return (
                                                    <div key={dest.id} className={`flex cursor-pointer items-start space-x-3 rounded-md border p-3 transition-all ${isChecked ? 'border-green-200 bg-green-50' : 'bg-white hover:border-blue-300'}`}>
                                                        <Checkbox id={`dest-${dest.id}`} checked={isChecked} onCheckedChange={(checked) => handleToggleDestination(dest, checked as boolean)} />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <label htmlFor={`dest-${dest.id}`} className="cursor-pointer text-sm leading-none font-medium">{dest.name}</label>
                                                            <p className="line-clamp-2 text-xs text-gray-500">{dest.description || 'Không có mô tả'}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                {/* @ts-ignore */}
                                {errors.province_id && <p className="mt-2 text-sm text-red-500">{errors.province_id}</p>}
                            </div>

                            <div>
                                <div className="mb-4 flex items-center justify-between border-b pb-2">
                                    <Label className="text-base font-semibold text-blue-700">Lịch trình chi tiết</Label>
                                    <Button type="button" size="sm" onClick={addSchedule}><Plus className="mr-1 h-4 w-4" /> Thêm Ngày</Button>
                                </div>
                                <div className="scrollbar-thin max-h-[600px] space-y-4 overflow-y-auto pr-2">
                                    {data.schedules.length === 0 && <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 text-gray-500"><p>Chưa có lịch trình nào.</p></div>}
                                    {scheduleWarning && <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">{scheduleWarning}</div>}
                                    {data.schedules.map((schedule, index) => (
                                        <div key={index} className="relative rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-300 hover:shadow-sm">
                                            <button type="button" onClick={() => removeSchedule(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="h-5 w-5" /></button>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs text-gray-500">Ngày</Label>
                                                    <Input type="number" min="1" className="bg-white" value={schedule.date} onChange={(e) => updateSchedule(index, 'date', e.target.value)} />
                                                </div>
                                                <div className="md:col-span-6">
                                                    <Label className="text-xs text-gray-500">Hoạt động</Label>
                                                    <Input className="bg-white font-medium" placeholder="VD: Tham quan..." value={schedule.name} onChange={(e) => updateSchedule(index, 'name', e.target.value)} />
                                                </div>
                                                <div className="md:col-span-4">
                                                    <Label className="text-xs text-gray-500">Địa điểm {selectedProvince ? `(${selectedProvince.name})` : ''}</Label>
                                                    <Select value={String(schedule.destination_id)} onValueChange={(v) => updateSchedule(index, 'destination_id', v)}>
                                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Chọn điểm đến" /></SelectTrigger>
                                                        <SelectContent>
                                                            {availableDestinations.length > 0 ? (
                                                                availableDestinations.map((d) => (
                                                                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                                                ))
                                                            ) : (<div className="p-2 text-center text-xs text-gray-500">Chưa có địa điểm nào</div>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="md:col-span-12">
                                                    <Label className="text-xs text-gray-500">Chi tiết</Label>
                                                    <Textarea className="bg-white" rows={2} value={schedule.description} onChange={(e) => updateSchedule(index, 'description', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: MÔ TẢ */}
                    <div className={currentStep === 3 ? 'block' : 'hidden'}>
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">3. Nội dung mô tả</h2>
                            <div className="space-y-6">
                                <div>
                                    <Label className="mb-2 block font-medium">Mô tả ngắn (Tóm tắt)</Label>
                                    <Textarea rows={3} value={data.short_description} onChange={(e) => setData('short_description', e.target.value)} className={errors.short_description ? 'border-red-500' : ''} />
                                    {errors.short_description && <p className="mt-1 text-xs text-red-500">{errors.short_description}</p>}
                                </div>
                                <div>
                                    <Label className="mb-2 block font-medium">Mô tả chi tiết</Label>
                                    <div className={`rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'}`}>
                                        <RichTextEditor value={data.description} onChange={(content) => setData('description', content)} height={400} />
                                    </div>
                                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: HÌNH ẢNH */}
                    <div className={currentStep === 4 ? 'block' : 'hidden'}>
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">4. Thư viện hình ảnh</h2>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div className="md:col-span-1">
                                    <Label className="mb-3 block font-medium">Ảnh đại diện</Label>
                                    <div className={`relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 hover:bg-gray-100 ${errors.thumbnail ? 'border-red-500' : 'border-gray-300'}`} onClick={() => fileInputRef.current?.click()}>
                                        {thumbnailPreview ? (
                                            <>
                                                <img src={thumbnailPreview} className="h-full w-full rounded-lg object-cover" />
                                                <button type="button" onClick={handleRemoveThumbnail} className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-700">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center">
                                                <UploadCloud className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                                                <span className="text-sm text-gray-500">Tải ảnh lên</span>
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                                    </div>
                                    {errors.thumbnail && <p className="mt-1 text-xs text-red-500">{errors.thumbnail}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="mb-3 block font-medium">Bộ sưu tập ảnh</Label>
                                    <div className="rounded-lg border border-gray-200 p-4">
                                        <div className="mb-4 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-8 hover:bg-gray-100">
                                            <label className="cursor-pointer text-center">
                                                <UploadCloud className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600">Thêm nhiều ảnh</span>
                                                <input type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryChange} />
                                            </label>
                                        </div>
                                        {galleryPreviews.length > 0 && (
                                            <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 mb-4">
                                                {galleryPreviews.map((src, idx) => (
                                                    <div key={idx} className="group relative aspect-square overflow-hidden rounded-md border">
                                                        <img src={src} className="h-full w-full object-cover" />
                                                        <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 hidden rounded-full bg-red-600 p-0.5 text-white shadow-sm group-hover:block"><X className="h-3 w-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {/* Existing Images */}
                                        {tour.images && tour.images.length > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <Label className="mb-2 block text-sm font-medium text-gray-700">Ảnh hiện tại (Chỉ xem)</Label>
                                                <div className="grid grid-cols-6 gap-2">
                                                    {tour.images.map((img) => (
                                                        <div key={img.id} className="relative aspect-square overflow-hidden rounded border">
                                                            <img src={img.img_url.startsWith('http') ? img.img_url : `/storage/${img.img_url}`} className="h-full w-full object-cover" alt={img.alt} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {errors.gallery_images && <p className="mt-2 text-xs text-red-500">{errors.gallery_images}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 5: Dịch vụ & Khác */}
                    <div className={currentStep === 5 ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:col-span-3">
                                <div className="mb-4 flex items-center justify-between border-b pb-2">
                                    <h3 className="text-lg font-bold text-gray-800">5. Dịch vụ đi kèm</h3>
                                    <Button type="button" size="sm" variant="outline" onClick={addTourService}><Plus className="mr-1 h-4 w-4" /> Thêm Dịch vụ</Button>
                                </div>
                                {!data.province_id && <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">Vui lòng chọn <strong>Tỉnh/Thành phố</strong> để hiển thị danh sách nhà cung cấp dịch vụ.</div>}
                                <div className="scrollbar-thin max-h-[600px] space-y-4 overflow-y-auto pr-2">
                                    {data.tour_services.map((item, index) => (
                                        <div key={index} className="relative flex flex-col gap-4 rounded-lg border bg-gray-50 p-4 hover:border-blue-300 md:flex-row md:items-start">
                                            <button type="button" onClick={() => removeTourService(index)} className="absolute -top-2 -right-2 rounded-full border bg-white p-1 text-red-500 shadow-sm hover:bg-red-50"><X className="h-4 w-4" /></button>
                                            <div className="flex-1">
                                                <Label className="text-xs text-gray-500">Tên dịch vụ</Label>
                                                <Select value={item.service_id} onValueChange={(v) => updateTourService(index, 'service_id', v)}>
                                                    <SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Chọn dịch vụ..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {availableServices.length > 0 ? (
                                                            availableServices.map((s) => (
                                                                <SelectItem key={s.id} value={String(s.id)}>{/* @ts-ignore */}{s.displayName}</SelectItem>
                                                            ))
                                                        ) : (<div className="p-2 text-center text-xs text-gray-500">Không có dịch vụ nào</div>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-24">
                                                <Label className="text-xs text-gray-500">SL</Label>
                                                <Input type="number" min="1" className="mt-1 bg-white" value={item.quantity} onChange={(e) => updateTourService(index, 'quantity', e.target.value)} />
                                            </div>
                                            <div className="w-24">
                                                <Label className="text-xs text-gray-500">Đơn vị</Label>
                                                <Input className="mt-1 bg-white" value={item.unit} onChange={(e) => updateTourService(index, 'unit', e.target.value)} />
                                            </div>
                                            <div className="w-32">
                                                <Label className="text-xs text-gray-500">Đơn giá</Label>
                                                <Input type="number" className="mt-1 bg-white" value={item.price_unit} onChange={(e) => updateTourService(index, 'price_unit', e.target.value)} />
                                            </div>
                                            <div className="w-32">
                                                <Label className="text-xs text-gray-500">Thành tiền</Label>
                                                <div className="mt-1 flex h-10 items-center rounded-md border bg-gray-100 px-3 font-bold text-green-600">${item.price_total.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 font-semibold text-gray-800">Chính sách</h3>
                                <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
                                    {policies.map((p) => (
                                        <label key={p.id} className="flex cursor-pointer items-start gap-2 rounded border p-2 hover:bg-gray-50">
                                            <Checkbox className="mt-0.5" checked={data.policy_ids.includes(p.id)} onCheckedChange={() => toggleSelection('policy_ids', p.id)} />
                                            <span className="text-sm text-gray-700">{p.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">Hướng dẫn viên</h3>
                                </div>
                                <p className="text-sm text-gray-600">Chọn hướng dẫn viên cho tour này. Các hướng dẫn viên này sẽ được tự động gán cho các chuyến đi mới.</p>
                                <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3">
                                    {guides.length === 0 ? (
                                        <p className="text-sm text-gray-500">Chưa có hướng dẫn viên nào trong hệ thống.</p>
                                    ) : (
                                        guides.map((guide) => (
                                            <div key={guide.id} className={`flex items-center justify-between rounded-md border p-3 ${guide.has_active_tour ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                                                <div className="flex items-center gap-3">
                                                    <Checkbox id={`guide-${guide.id}`} checked={data.guide_ids.includes(guide.id)} onCheckedChange={() => toggleSelection('guide_ids', guide.id)} disabled={guide.has_active_tour} />
                                                    <Label htmlFor={`guide-${guide.id}`} className={`cursor-pointer ${guide.has_active_tour ? 'text-gray-400' : 'text-gray-700'}`}>{guide.name} ({guide.email})</Label>
                                                </div>
                                                {guide.has_active_tour && <Badge variant="secondary" className="bg-amber-100 text-amber-800">Đã có tour</Badge>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 6: TÍNH GIÁ & LỢI NHUẬN */}
                    <div className={currentStep === 6 ? 'block' : 'hidden'}>
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 border-b pb-4 text-xl font-semibold text-gray-800">6. Công cụ Tính giá & Lợi nhuận</h2>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                {/* CỘT TRÁI: THAM SỐ ĐẦU VÀO */}
                                <div className="space-y-6 rounded-lg bg-gray-50 p-4 border border-gray-200">
                                    <h3 className="font-semibold text-blue-700 uppercase p-2 bg-blue-50 rounded">1. Tham số tính toán</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Số khách dự kiến (Người)</Label>
                                            <Input type="number" min="1" value={pricingConfig.guestEstimate} onChange={e => setPricingConfig({ ...pricingConfig, guestEstimate: Number(e.target.value) })} className="bg-white" />
                                            <p className="text-xs text-gray-500">Dùng để chia đều chi phí cố định.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lương Guide/Ngày</Label>
                                            <Input type="number" min="0" value={pricingConfig.guideSalaryDay} onChange={e => setPricingConfig({ ...pricingConfig, guideSalaryDay: Number(e.target.value) })} className="bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bảo hiểm/Người</Label>
                                            <Input type="number" min="0" value={pricingConfig.insurancePerPax} onChange={e => setPricingConfig({ ...pricingConfig, insurancePerPax: Number(e.target.value) })} className="bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phí quản lý/Người</Label>
                                            <Input type="number" min="0" value={pricingConfig.managementFee} onChange={e => setPricingConfig({ ...pricingConfig, managementFee: Number(e.target.value) })} className="bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lợi nhuận mục tiêu (%)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" min="0" max="100" value={pricingConfig.profitMargin} onChange={e => setPricingConfig({ ...pricingConfig, profitMargin: Number(e.target.value) })} className="bg-white" />
                                                <span className="font-bold text-gray-600">%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Thuế VAT (%)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" min="0" max="100" value={pricingConfig.taxRate} onChange={e => setPricingConfig({ ...pricingConfig, taxRate: Number(e.target.value) })} className="bg-white" />
                                                <span className="font-bold text-gray-600">%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tỷ lệ giá Trẻ em (%)</Label>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" min="0" max="100" value={pricingConfig.childrenPercentage} onChange={e => setPricingConfig({ ...pricingConfig, childrenPercentage: Number(e.target.value) })} className="bg-white" />
                                                <span className="font-bold text-gray-600">%</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Thường là 50%, 75% hoặc 100% giá người lớn.</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Tổng hợp Dịch vụ đã chọn:</h4>
                                        <div className="text-sm bg-white p-3 rounded border max-h-40 overflow-y-auto">
                                            {data.tour_services.length === 0 ? <span className="text-gray-400">Chưa chọn dịch vụ nào</span> :
                                                data.tour_services.map((s, idx) => (
                                                    <div key={idx} className="flex justify-between py-1 border-b last:border-0 border-dashed">
                                                        <span className="truncate w-2/3">{s.service_name}</span>
                                                        <span className="font-medium">{s.price_total.toLocaleString()}</span>
                                                    </div>
                                                ))
                                            }
                                            <div className="flex justify-between mt-2 pt-2 border-t font-bold text-blue-600">
                                                <span>Tổng tiền dịch vụ:</span>
                                                <span>{calculatedPrices.totalServiceCost.toLocaleString()} đ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: KẾT QUẢ TÍNH TOÁN */}
                                <div className="space-y-6 rounded-lg bg-green-50 p-4 border border-green-200 h-fit">
                                    <h3 className="font-semibold text-green-700 uppercase p-2 bg-green-100 rounded">2. Bảng giá thành (Ước tính)</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Chi phí dịch vụ/khách:</span>
                                            <span className="font-medium">{calculatedPrices.serviceCostPerPax.toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Chi phí Guide/khách:</span>
                                            <span className="font-medium">{calculatedPrices.guideCostPerPax.toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Bảo hiểm:</span>
                                            <span className="font-medium">{pricingConfig.insurancePerPax.toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                                            <span className="font-semibold text-gray-700">GIÁ VỐN/KHÁCH:</span>
                                            <span className="font-bold text-gray-800">{calculatedPrices.baseCost.toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">+ Phí quản lý:</span>
                                            <span className="font-medium">{pricingConfig.managementFee.toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">+ Lợi nhuận ({pricingConfig.profitMargin}%):</span>
                                            <span className="font-medium">{(calculatedPrices.priceBeforeTax - calculatedPrices.costWithMgmt).toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">+ Thuế VAT ({pricingConfig.taxRate}%):</span>
                                            <span className="font-medium">{(calculatedPrices.finalPrice - calculatedPrices.priceBeforeTax).toLocaleString()} đ</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-lg font-bold text-blue-700">GIÁ BÁN ĐỀ XUẤT:</span>
                                            <span className="text-2xl font-bold text-blue-700">{calculatedPrices.finalPrice.toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4 text-right">(Đã làm tròn đến hàng nghìn)</p>

                                        <Button type="button" onClick={applyCalculatedPrice} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                                            <Check className="w-4 h-4 mr-2" />
                                            Áp dụng giá này vào Form
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col md:flex-row gap-6 items-end">
                                <div className="flex-1 w-full">
                                    <Label className="text-base">Giá Người lớn</Label>
                                    <Input type="number" min="0" value={data.price_adult} onChange={e => setData('price_adult', Number(e.target.value))} className="text-lg font-bold text-green-700 mt-1" />
                                    {errors.price_adult && <p className="mt-1 text-xs text-red-500">{errors.price_adult}</p>}
                                </div>
                                <div className="flex-1 w-full">
                                    <Label className="text-base">Giá Trẻ em ({pricingConfig.childrenPercentage}%)</Label>
                                    <Input type="number" min="0" value={data.price_children} onChange={e => setData('price_children', Number(e.target.value))} className="text-lg font-bold text-green-700 mt-1" />
                                    {errors.price_children && <p className="mt-1 text-xs text-red-500">{errors.price_children}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="sticky bottom-0 z-20 flex justify-between gap-4 border-t bg-white/95 p-4 shadow-lg backdrop-blur">
                        <Button type="button" variant="outline" size="lg" onClick={() => window.history.back()} className="text-gray-500">
                            Hủy bỏ
                        </Button>

                        <div className="flex gap-4">
                            {currentStep > 1 && (
                                <Button type="button" variant="outline" size="lg" onClick={handleBack}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                                </Button>
                            )}

                            {currentStep < 6 ? (
                                <Button type="button" size="lg" onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                                    Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={!canSubmit || processing} size="lg" className="min-w-[200px] bg-green-600 hover:bg-green-700">
                                    {processing ? 'Đang xử lý...' : <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Cập Nhật Tour</span>}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
