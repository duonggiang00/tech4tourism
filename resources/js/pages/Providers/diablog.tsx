import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import providersUrl from '@/routes/providers';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface Service {
    id?: number;
    name: string;
    service_type_id: string;
    price: string;
}

interface ServiceType {
    id: number;
    name: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Provider;
    title: string;
    serviceTypes: ServiceType[];
}

export function ProviderFormDialog({ open, onOpenChange, initialData, title, serviceTypes }: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        email: '',
        hotline: '',
        address: '',
        website: '',
        status: '1',
        notes: '',
        services: [] as Service[],
    });

    useEffect(() => {
        if (initialData) {
            setData({
                name: initialData.name || '',
                description: initialData.description || '',
                email: initialData.email || '',
                hotline: initialData.hotline || '',
                address: initialData.address || '',
                website: initialData.website || '',
                status: initialData.status || '1',
                notes: initialData.notes || '',
                services: [], // Reset services when editing provider (optional: load existing services if API supports)
            });
        } else {
            reset();
        }
    }, [initialData, open]);

    const handleAddService = () => {
        setData('services', [
            ...data.services,
            { name: '', service_type_id: '', price: '' },
        ]);
    };

    const handleRemoveService = (index: number) => {
        const newServices = [...data.services];
        newServices.splice(index, 1);
        setData('services', newServices);
    };

    const handleServiceChange = (index: number, field: keyof Service, value: string) => {
        const newServices = [...data.services];
        newServices[index] = { ...newServices[index], [field]: value };
        setData('services', newServices);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (initialData?.id) {
            put(providersUrl.update(initialData.id).url, {
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post(providersUrl.store().url, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Thông tin chung</h3>
                            <div>
                                <label className="text-sm font-medium">Tên Nhà Cung Cấp <span className="text-red-500">*</span></label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nhập tên nhà cung cấp"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="example@email.com"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Hotline</label>
                                <Input
                                    value={data.hotline}
                                    onChange={(e) => setData('hotline', e.target.value)}
                                    placeholder="Số điện thoại"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Website</label>
                                <Input
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Trạng thái</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-md border border-gray-300 p-2"
                                >
                                    <option value="0">Không hoạt động</option>
                                    <option value="1">Hoạt động</option>
                                    <option value="2">Tạm ngưng</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Địa chỉ & Ghi chú</h3>
                            <div>
                                <label className="text-sm font-medium">Địa chỉ</label>
                                <Textarea
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Nhập địa chỉ"
                                    className="h-24"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Ghi chú</label>
                                <Textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Ghi chú thêm (nếu có)"
                                    className="h-24"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Dịch vụ cung cấp</h3>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddService}>
                                + Thêm dịch vụ
                            </Button>
                        </div>

                        {data.services.length === 0 ? (
                            <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded">
                                Chưa có dịch vụ nào được thêm.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.services.map((service, index) => (
                                    <div key={index} className="flex gap-2 items-start p-3 border rounded bg-gray-50">
                                        <div className="w-1/3 space-y-1">
                                            <select
                                                value={service.service_type_id}
                                                onChange={(e) => handleServiceChange(index, 'service_type_id', e.target.value)}
                                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                                required
                                            >
                                                <option value="">-- Loại dịch vụ --</option>
                                                {serviceTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-1/3 space-y-1">
                                            <Input
                                                value={service.name}
                                                onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                                placeholder="Tên dịch vụ"
                                                className="h-9"
                                                required
                                            />
                                        </div>
                                        <div className="w-1/4 space-y-1">
                                            <Input
                                                type="number"
                                                value={service.price}
                                                onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                                placeholder="Giá"
                                                className="h-9"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveService(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <span className="text-xl">×</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.services && <p className="text-sm text-red-500 mt-2">{errors.services}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {initialData ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
