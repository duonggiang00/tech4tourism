import { Service, TourService } from '@/app';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: number;
    availableServices: Service[];
    editingTourService?: TourService | null;
    onSuccess?: () => void;
}

export function TourServiceDialog({
    open,
    onOpenChange,
    tourId,
    availableServices = [],
    editingTourService,
    onSuccess,
}: Props) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        service_id: '',
        quantity: 1,
        unit: '',
        price_unit: 0,
        price_total: 0,
        description: '',
    });

    // 1. Reset form hoặc fill dữ liệu cũ khi mở Dialog
    useEffect(() => {
        if (open) {
            if (editingTourService) {
                setForm({
                    service_id: String(editingTourService.service_id),
                    quantity: editingTourService.quantity,
                    unit: editingTourService.unit,
                    price_unit: editingTourService.price_unit,
                    price_total: editingTourService.price_total,
                    description: editingTourService.description || '',
                });
            } else {
                setForm({
                    service_id: '',
                    quantity: 1,
                    unit: '',
                    price_unit: 0,
                    price_total: 0,
                    description: '',
                });
            }
        }
    }, [open, editingTourService]);

    // 2. Tự động tính tổng tiền khi số lượng hoặc đơn giá thay đổi
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            price_total: prev.quantity * prev.price_unit,
        }));
    }, [form.quantity, form.price_unit]);

    // 3. Xử lý khi chọn Dịch vụ mới
    const handleSelectService = (serviceIdStr: string) => {
        const selectedMasterService = availableServices.find(
            (s) => s.id === Number(serviceIdStr),
        );

        if (selectedMasterService) {
            // Khi đổi dịch vụ:
            // - Cập nhật ID
            // - Cập nhật lại Unit và Price theo dịch vụ mới
            // - Giữ nguyên Quantity và Description hiện tại
            setForm((prev) => ({
                ...prev,
                service_id: serviceIdStr,
                unit: selectedMasterService.unit || '',
                price_unit: selectedMasterService.price,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.service_id) return toast.error('Vui lòng chọn dịch vụ');

        setLoading(true);
        try {
            const payload = {
                ...form,
                service_id: Number(form.service_id),
            };

            // Lưu ý đường dẫn API: phải có /api ở trước
            if (editingTourService) {
                await axios.put(
                    `/tours/${tourId}/tourservices/${editingTourService.id}`,
                    payload,
                );
                toast.success('Cập nhật thành công');
            } else {
                await axios.post(`/tours/${tourId}/tourservices`, payload);
                toast.success('Thêm mới thành công');
            }
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            console.error('API Error:', error);
            toast.error(
                'Có lỗi xảy ra: ' +
                    (error.response?.data?.message || 'Lỗi server'),
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {editingTourService
                            ? 'Cập nhật dịch vụ đi kèm'
                            : 'Thêm dịch vụ vào Tour'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Dropdown chọn Service Gốc */}
                    <div className="space-y-1">
                        <Label>
                            Dịch vụ <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={form.service_id}
                            onValueChange={handleSelectService}
                            // Đã xóa thuộc tính disabled={!!editingTourService}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="-- Chọn dịch vụ --" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableServices?.length > 0 ? (
                                    availableServices.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={String(s.id)}
                                        >
                                            {s.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-center text-sm text-gray-500">
                                        Chưa có dữ liệu dịch vụ
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Số lượng</Label>
                            <Input
                                type="number"
                                min={1}
                                value={form.quantity}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        quantity: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Đơn vị tính</Label>
                            <Input
                                value={form.unit}
                                onChange={(e) =>
                                    setForm({ ...form, unit: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Đơn giá ($)</Label>
                            <Input
                                type="number"
                                value={form.price_unit}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        price_unit: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Thành tiền ($)</Label>
                            <Input
                                value={form.price_total}
                                readOnly
                                className="bg-gray-100 font-bold text-blue-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Ghi chú</Label>
                        <Textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Ghi chú cho dịch vụ này..."
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            Lưu lại
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
