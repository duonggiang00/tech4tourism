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

interface Provider {
    id?: number;
    name: string;
    description?: string;
    email?: string;
    hotline?: string;
    address?: string;
    website?: string;
    status: string;
    notes?: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Provider;
    title: string;
}

export function ProviderFormDialog({ open, onOpenChange, initialData, title }: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        email: '',
        hotline: '',
        address: '',
        website: '',
        status: '1',
        notes: '',
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
            });
        } else {
            reset();
        }
    }, [initialData, open]);

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
            <DialogContent className="max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Tên Nhà Cung Cấp</label>
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
                        <label className="text-sm font-medium">Địa chỉ</label>
                        <Textarea
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Nhập địa chỉ"
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

                    <div>
                        <label className="text-sm font-medium">Ghi chú</label>
                        <Textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Ghi chú thêm (nếu có)"
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
