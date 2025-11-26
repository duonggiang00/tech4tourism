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
import serviceTypes from '@/routes/service-types';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface ServiceType {
    id?: number;
    name: string;
    icon?: string;
    description?: string;
    order?: number;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: ServiceType;
    title: string;
}

export function ServiceTypeFormDialog({
    open,
    onOpenChange,
    initialData,
    title,
}: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        icon: '',
        description: '',
        order: 0,
    });

    useEffect(() => {
        if (initialData) {
            setData({
                name: initialData.name || '',
                icon: initialData.icon || '',
                description: initialData.description || '',
                order: initialData.order || 0,
            });
        } else {
            reset();
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (initialData?.id) {
            put(serviceTypes.update(initialData.id).url, {
                onSuccess: () => onOpenChange(false),
            });
        } else {
            post(serviceTypes.store().url, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
                forceFormData: true,
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
                            Tên loại dịch vụ
                        </label>
                        <Input
                            placeholder="Nhập tên loại dịch vụ"
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
                            Icon (URL)
                        </label>
                        <Input
                            placeholder="https://..."
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                        />
                        {errors.icon && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.icon}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Mô tả</label>
                        <Textarea
                            placeholder="Nhập mô tả loại dịch vụ"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Thứ tự hiển thị
                        </label>
                        <Input
                            type="number"
                            min={0}
                            value={data.order}
                            onChange={(e) =>
                                setData('order', Number(e.target.value))
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
