/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import services from '@/routes/services';

import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Globe,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// TYPES ========================
interface ServiceType {
    id: number;
    name: string;
}

interface Service {
    id?: number;
    name: string;
    description?: string;
    unit?: string;
    service_type?: ServiceType;
}

interface Provider {
    id: number;
    name: string;
    province?: { id: number; name: string };
    email?: string;
    hotline?: string;
    address?: string;
    website?: string;
    status: string;
    notes?: string;
    services: Service[];
}

interface PageProps {
    provider: Provider;
    serviceTypes: ServiceType[];
}

// ============================================
export default function Show() {
    const { provider, serviceTypes } = usePage<PageProps>().props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Service | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        unit: '',
        provider_id: provider.id,
        service_type_id: undefined,
    });

    // OPEN FORM ========================
    useEffect(() => {
        if (currentService) {
            setData({
                name: currentService.name,
                description: currentService.description,
                unit: currentService.unit,
                provider_id: provider.id,
                service_type_id: currentService.service_type?.id,
            });
        } else {
            reset();
            setData('provider_id', provider.id);
        }
    }, [currentService, isDialogOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // UPDATE
        if (currentService?.id) {
            put(services.update(currentService.id).url + '?from=provider', {
                onSuccess: () => {
                    toast.success('Cập nhật dịch vụ thành công!');
                    setIsDialogOpen(false);
                },
            });
        } else {
            // CREATE
            post(services.store().url + '?from=provider', {
                onSuccess: () => {
                    toast.success('Thêm dịch vụ thành công!');
                    setIsDialogOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa dịch vụ "${name}"?`)) {
            router.delete(services.destroy(id).url + '?from=provider', {
                preserveScroll: true,
                onSuccess: () => toast.success('Xóa dịch vụ thành công!'),
            });
        }
    };

    // Helpers
    const openCreate = () => {
        setCurrentService(null);
        setIsDialogOpen(true);
    };
    const openEdit = (s: Service) => {
        setCurrentService(s);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title={`Chi tiết - ${provider.name}`} />

            <div className="mx-auto mt-8 max-w-6xl space-y-8">
                {/* -------------- PROVIDER CARD -------------- */}
                <Card className="shadow-md transition hover:shadow-lg">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                            Thông tin Nhà Cung Cấp
                        </CardTitle>

                        <Link href={providersUrl.index().url}>
                            <Button variant="ghost">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                            </Button>
                        </Link>
                    </CardHeader>

                    <CardContent className="grid grid-cols-2 gap-6 text-[15px]">
                        <div className="space-y-3">
                            <p>
                                <strong>Tên:</strong> {provider.name}
                            </p>

                            <p className="flex items-center gap-2">
                                <MapPin size={18} className="text-blue-600" />
                                {provider.province?.name || '—'}
                            </p>

                            <p className="flex items-center gap-2">
                                <Mail size={18} className="text-gray-600" />
                                {provider.email || '—'}
                            </p>

                            <p className="flex items-center gap-2">
                                <Phone size={18} className="text-green-600" />
                                {provider.hotline || '—'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="flex items-center gap-2">
                                <Globe size={18} className="text-purple-600" />
                                {provider.website || '—'}
                            </p>

                            <p>
                                <strong>Địa chỉ:</strong>{' '}
                                {provider.address || '—'}
                            </p>

                            <p>
                                <strong>Ghi chú:</strong>{' '}
                                {provider.notes || '—'}
                            </p>

                            <p>
                                <strong>Trạng thái:</strong>{' '}
                                {provider.status === '1' ? (
                                    <Badge className="border border-green-300 bg-green-100 text-green-700">
                                        Hoạt động
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">
                                        Không hoạt động
                                    </Badge>
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* -------------- SERVICES LIST -------------- */}
                <Card className="shadow-md">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold">
                            Dịch vụ đi kèm
                        </CardTitle>
                        <Button
                            onClick={openCreate}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Thêm dịch vụ
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {provider.services.length === 0 && (
                            <p className="text-gray-500 italic">
                                Chưa có dịch vụ nào.
                            </p>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {provider.services.map((service) => (
                                <div
                                    key={service.id}
                                    className="flex justify-between rounded-lg border bg-white p-5 shadow-sm transition hover:shadow"
                                >
                                    <div>
                                        <p className="text-lg font-semibold">
                                            {service.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Loại dịch vụ:{' '}
                                            {service.service_type?.name}
                                        </p>
                                        <p className="text-sm">
                                            Đơn vị: {service.unit || '—'}
                                        </p>
                                        <p className="text-sm">
                                            Mô tả: {service.description || '—'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEdit(service)}
                                            className="hover:text-amber-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(
                                                    service.id!,
                                                    service.name,
                                                )
                                            }
                                            className="hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* -------------- MODAL FORM -------------- */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                {currentService
                                    ? `Chỉnh sửa dịch vụ: ${currentService.name}`
                                    : 'Thêm dịch vụ mới'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">
                                    Tên dịch vụ
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

                            <div>
                                <label className="text-sm font-medium">
                                    Loại dịch vụ
                                </label>
                                <Select
                                    value={
                                        data.service_type_id?.toString() || ''
                                    }
                                    onValueChange={(val) =>
                                        setData('service_type_id', Number(val))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại dịch vụ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {serviceTypes.map((type) => (
                                            <SelectItem
                                                key={type.id}
                                                value={type.id.toString()}
                                            >
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Đơn vị
                                </label>
                                <Input
                                    value={data.unit || ''}
                                    onChange={(e) =>
                                        setData('unit', e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Mô tả
                                </label>
                                <Textarea
                                    value={data.description || ''}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    {currentService
                                        ? 'Lưu thay đổi'
                                        : 'Tạo mới'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
