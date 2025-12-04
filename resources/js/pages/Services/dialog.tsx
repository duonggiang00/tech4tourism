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
import serviceUrl from '@/routes/services';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface Service {
    id?: number;
    service_type_id?: number;
    provider_id?: number;
    name: string;
    description?: string;
    unit?: string;
}

interface ServiceType {
    id: number;
    name: string;
}

interface Provider {
    id: number;
    name: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Service;
    title: string;
    service_types: ServiceType[];
    providers: Provider[];
}

export function ServiceFormDialog({
    open,
    onOpenChange,
    initialData,
    title,
    service_types,
    providers,
}: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        service_type_id: '',
        provider_id: '',
        name: '',
        description: '',
        unit: '',
    });

    // 🔥 Load dữ liệu khi sửa
    useEffect(() => {
        if (initialData) {
            setData({
                service_type_id: initialData.service_type_id?.toString() || '',
                provider_id: initialData.provider_id?.toString() || '',
                name: initialData.name || '',
                description: initialData.description || '',
                unit: initialData.unit || '',
            });
        } else {
            reset();
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (initialData?.id) {
            put(serviceUrl.update(initialData.id).url, {
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post(serviceUrl.store().url, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* TÊN DỊCH VỤ */}
                    <div>
                        <label className="text-sm font-medium">
                            Tên dịch vụ
                        </label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* LOẠI DỊCH VỤ */}
                    <div>
                        <label className="text-sm font-medium">
                            Loại dịch vụ
                        </label>
                        <select
                            className="w-full rounded-md border px-3 py-2"
                            value={data.service_type_id}
                            onChange={(e) =>
                                setData('service_type_id', e.target.value)
                            }
                        >
                            <option value="">-- Chọn loại --</option>
                            {service_types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {errors.service_type_id && (
                            <p className="text-sm text-red-500">
                                {errors.service_type_id}
                            </p>
                        )}
                    </div>

                    {/* NHÀ CUNG CẤP */}
                    <div>
                        <label className="text-sm font-medium">
                            Nhà cung cấp
                        </label>
                        <select
                            className="w-full rounded-md border px-3 py-2"
                            value={data.provider_id}
                            onChange={(e) =>
                                setData('provider_id', e.target.value)
                            }
                        >
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {providers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>

                        {errors.provider_id && (
                            <p className="text-sm text-red-500">
                                {errors.provider_id}
                            </p>
                        )}
                    </div>

                    {/* MÔ TẢ */}
                    <div>
                        <label className="text-sm font-medium">Mô tả</label>
                        <Textarea
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>

                    {/* ĐƠN VỊ */}
                    <div>
                        <label className="text-sm font-medium">Đơn vị</label>
                        <Input
                            value={data.unit}
                            onChange={(e) => setData('unit', e.target.value)}
                        />
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
