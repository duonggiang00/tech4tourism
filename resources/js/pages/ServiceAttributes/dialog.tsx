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
import serviceAttributes from '@/routes/service-attributes';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface Service {
    id: number;
    name: string;
}

interface ServiceAttribute {
    id?: number;
    id_service?: number;
    name: string;
    value?: string;
    type?: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: ServiceAttribute;
    title: string;
    services: Service[];
}

export function ServiceAttributeFormDialog({
    open,
    onOpenChange,
    initialData,
    title,
    services,
}: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm<{
        id_service: number | null;
        name: string;
        value: string;
        type: string;
    }>({
        id_service: null,
        name: '',
        value: '',
        type: '',
    });

    useEffect(() => {
        if (initialData) {
            setData({
                id_service: initialData.id_service || undefined,
                name: initialData.name || '',
                value: initialData.value || '',
                type: initialData.type || '',
            });
        } else {
            reset();
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (initialData?.id) {
            put(serviceAttributes.update(initialData.id).url, {
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post(serviceAttributes.store().url, {
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
                            Chọn Dịch Vụ
                        </label>
                        <select
                            value={data.id_service ?? ''}
                            onChange={(e) =>
                                setData('id_service', Number(e.target.value))
                            }
                            className="w-full rounded-md border border-gray-300 p-2"
                        >
                            <option value="">-- Chọn dịch vụ --</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                        {errors.id_service && (
                            <p className="text-sm text-red-500">
                                {errors.id_service}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Tên Thuộc Tính
                        </label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="VD: Wifi, Bữa sáng..."
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Giá Trị</label>
                        <Textarea
                            value={data.value}
                            onChange={(e) => setData('value', e.target.value)}
                            placeholder="VD: Miễn phí, Có tính phí..."
                        />
                        {errors.value && (
                            <p className="text-sm text-red-500">
                                {errors.value}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Loại</label>
                        <Input
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            placeholder="VD: Tiện ích, Quy định..."
                        />
                        {errors.type && (
                            <p className="text-sm text-red-500">
                                {errors.type}
                            </p>
                        )}
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
