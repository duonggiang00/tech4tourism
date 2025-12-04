import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import providersUrl from '@/routes/providers';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface ServiceType {
    id: number;
    name: string;
}

interface Province {
    id: number;
    name: string;
}

interface Service {
    id?: number;
    name: string;
    description?: string;
    unit?: string;
    service_type_id?: number;
}

interface Provider {
    id?: number;
    name: string;
    email?: string;
    hotline?: string;
    address?: string;
    website?: string;
    notes?: string;
    status?: string;
    province_id?: number;
    services?: Service[];
}

interface PageProps {
    provider: Provider | null;
    serviceTypes: ServiceType[];
    provinces: Province[];
}

export default function Form() {
    const { provider, serviceTypes, provinces } = usePage<PageProps>().props;

    const isEdit = !!provider;

    const { data, setData, post, put, processing, errors } = useForm({
        name: provider?.name ?? '',
        email: provider?.email ?? '',
        hotline: provider?.hotline ?? '',
        address: provider?.address ?? '',
        website: provider?.website ?? '',
        notes: provider?.notes ?? '',
        status: provider?.status ?? '1',
        province_id: provider?.province_id ?? '',
        services:
            provider?.services?.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description ?? '',
                unit: s.unit ?? '',
                service_type_id: s.service_type_id ?? '',
            })) ?? [],
    });

    const addService = () => {
        setData('services', [
            ...data.services,
            { name: '', description: '', unit: '', service_type_id: '' },
        ]);
    };

    const removeService = (index: number) => {
        const updated = [...data.services];
        updated.splice(index, 1);
        setData('services', updated);
    };

    const handleServiceChange = (index: number, field: string, value: any) => {
        const updated = [...data.services];
        updated[index][field] = value;
        setData('services', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && provider?.id) {
            put(providersUrl.update(provider.id).url);
        } else {
            post(providersUrl.store().url);
        }
    };

    return (
        <AppLayout>
            <Head
                title={isEdit ? 'Chỉnh sửa nhà cung cấp' : 'Tạo nhà cung cấp'}
            />

            <div className="mx-auto mt-10 max-w-5xl space-y-10">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {isEdit ? 'Chỉnh sửa Nhà Cung Cấp' : 'Tạo Nhà Cung Cấp'}
                    </h1>

                    <Link href={providersUrl.index().url}>
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* ===== Provider Info ===== */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">
                            Thông tin Nhà Cung Cấp
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            {/* LEFT COLUMN */}
                            <div className="space-y-4">
                                {/* Province */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Tỉnh / Thành phố
                                    </label>
                                    <Select
                                        value={
                                            data.province_id?.toString() ?? ''
                                        }
                                        onValueChange={(val) =>
                                            setData('province_id', Number(val))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn tỉnh / thành phố" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {provinces.map((p) => (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.id.toString()}
                                                >
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {errors.province_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.province_id}
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Tên nhà cung cấp
                                    </label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Email
                                    </label>
                                    <Input
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                </div>

                                {/* Hotline */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Hotline
                                    </label>
                                    <Input
                                        value={data.hotline}
                                        onChange={(e) =>
                                            setData('hotline', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">
                                        Địa chỉ
                                    </label>
                                    <Textarea
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">
                                        Website
                                    </label>
                                    <Input
                                        value={data.website}
                                        onChange={(e) =>
                                            setData('website', e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">
                                        Ghi chú
                                    </label>
                                    <Textarea
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== SERVICES BLOCK ===== */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Dịch vụ đi kèm
                            </h2>

                            <Button type="button" onClick={addService}>
                                <Plus className="mr-2 h-4 w-4" /> Thêm dịch vụ
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {data.services.map((service, index) => (
                                <div
                                    key={index}
                                    className="relative rounded-md border p-4 shadow-sm"
                                >
                                    {/* Remove Button */}
                                    <button
                                        type="button"
                                        onClick={() => removeService(index)}
                                        className="absolute top-3 right-3 text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="space-y-3">
                                        {/* Name */}
                                        <div>
                                            <label className="text-sm font-medium">
                                                Tên dịch vụ
                                            </label>
                                            <Input
                                                value={service.name}
                                                onChange={(e) =>
                                                    handleServiceChange(
                                                        index,
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="text-sm font-medium">
                                                Loại dịch vụ
                                            </label>

                                            <Select
                                                value={
                                                    service.service_type_id?.toString() ??
                                                    ''
                                                }
                                                onValueChange={(val) =>
                                                    handleServiceChange(
                                                        index,
                                                        'service_type_id',
                                                        Number(val),
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại dịch vụ" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {serviceTypes.map(
                                                        (type) => (
                                                            <SelectItem
                                                                key={type.id}
                                                                value={type.id.toString()}
                                                            >
                                                                {type.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Unit */}
                                        <div>
                                            <label className="text-sm font-medium">
                                                Đơn vị
                                            </label>
                                            <Input
                                                value={service.unit}
                                                onChange={(e) =>
                                                    handleServiceChange(
                                                        index,
                                                        'unit',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="text-sm font-medium">
                                                Mô tả
                                            </label>
                                            <Textarea
                                                value={service.description}
                                                onChange={(e) =>
                                                    handleServiceChange(
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

                    {/* SUBMIT */}
                    <Button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 text-base"
                    >
                        {isEdit ? 'Cập nhật Nhà Cung Cấp' : 'Tạo Nhà Cung Cấp'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
