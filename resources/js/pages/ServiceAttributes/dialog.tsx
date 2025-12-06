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
    service_id?: number;
    name: string;
    value?: string;
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
    const { data, setData, post, put, processing, errors, reset } = useForm({
        service_id: '',
        name: '',
        value: '',
    });

    useEffect(() => {
        if (initialData) {
            setData({
                service_id: initialData.service_id || '',
                name: initialData.name || '',
                value: initialData.value || '',
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
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Chọn dịch vụ */}
                    <div>
                        <label className="text-sm font-medium">Dịch vụ</label>
                        <select
                            value={data.service_id}
                            onChange={(e) =>
                                setData('service_id', Number(e.target.value))
                            }
                            className="w-full rounded-md border p-2"
                        >
                            <option value="">-- Chọn dịch vụ --</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        {errors.service_id && (
                            <p className="text-sm text-red-500">
                                {errors.service_id}
                            </p>
                        )}
                    </div>

                    {/* Tên thuộc tính */}
                    <div>
                        <label className="text-sm font-medium">
                            Tên thuộc tính
                        </label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="VD: Wifi, Hồ bơi..."
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Giá trị */}
                    <div>
                        <label className="text-sm font-medium">Giá trị</label>
                        <Textarea
                            value={data.value}
                            onChange={(e) => setData('value', e.target.value)}
                            placeholder="VD: Miễn phí, Có tính phí..."
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
