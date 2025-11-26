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
    id_service_type?: number;
    id_provider?: number;
    name: string;
    description?: string;
    price?: number;
    type_room?: string;
    type_car?: string;
    type_meal?: string;
    limit?: number;
    unit?: string;
    priceDefault?: string;
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
        id_service_type: '',
        id_provider: '',
        name: '',
        description: '',
        price: '',
        type_room: '',
        type_car: '',
        type_meal: '',
        limit: '',
        unit: '',
        priceDefault: '',
    });

    useEffect(() => {
        if (initialData) {
            setData({
                id_service_type: initialData.id_service_type || '',
                id_provider: initialData.id_provider || '',
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price?.toString() || '',
                type_room: initialData.type_room || '',
                type_car: initialData.type_car || '',
                type_meal: initialData.type_meal || '',
                limit: initialData.limit?.toString() || '',
                unit: initialData.unit || '',
                priceDefault: initialData.priceDefault || '',
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
                    <div>
                        <label className="text-sm font-medium">
                            Tên dịch vụ
                        </label>
                        <Input
                            placeholder="Nhập tên dịch vụ"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Loại dịch vụ
                        </label>
                        <select
                            className="w-full rounded-md border px-3 py-2"
                            value={data.id_service_type}
                            onChange={(e) =>
                                setData('id_service_type', e.target.value)
                            }
                        >
                            <option value="">-- Chọn loại --</option>
                            {service_types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Nhà cung cấp
                        </label>
                        <select
                            className="w-full rounded-md border px-3 py-2"
                            value={data.id_provider}
                            onChange={(e) =>
                                setData('id_provider', e.target.value)
                            }
                        >
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {providers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Giá</label>
                        <Input
                            type="number"
                            placeholder="Nhập giá (VND)"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Mô tả</label>
                        <Textarea
                            placeholder="Nhập mô tả dịch vụ"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
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
