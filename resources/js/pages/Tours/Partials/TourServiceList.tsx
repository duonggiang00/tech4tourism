import { TourService } from '@/app';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Box,
    Edit,
    FileText,
    Layers,
    Package,
    Plus,
    StickyNote,
    Tag,
    Trash2,
} from 'lucide-react';

interface Props {
    tourServices: TourService[];
    onAdd: () => void;
    onEdit: (item: TourService) => void;
    onDelete: (item: TourService) => void;
}

export default function TourServiceList({
    tourServices,
    onAdd,
    onEdit,
    onDelete,
}: Props) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <Package className="h-5 w-5 text-blue-600" />
                    Dịch vụ đi kèm ({tourServices.length})
                </CardTitle>
                <Button size="sm" variant="outline" onClick={onAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm mới
                </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {tourServices.length === 0 ? (
                    <div className="rounded-md border border-dashed py-8 text-center text-sm text-gray-500">
                        Chưa có dịch vụ nào được thêm vào tour này.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tourServices.map((item) => (
                            <div
                                key={item.id}
                                className="relative flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                            >
                                {/* Header Box: Tên & Loại hình */}
                                <div className="flex items-start justify-between pr-20">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-800">
                                                {item.service?.name ||
                                                    'Dịch vụ không xác định'}
                                            </h4>
                                            <Badge
                                                variant="secondary"
                                                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                            >
                                                <Layers className="mr-1 h-3 w-3" />
                                                {item.service?.service_type
                                                    ?.name || 'Khác'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Nội dung chi tiết */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Cột trái: Thông tin mô tả */}
                                    <div className="space-y-3 text-sm">
                                        {/* Nội dung gốc từ Service */}
                                        <div className="flex gap-2">
                                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                            <div>
                                                <span className="font-medium text-gray-600">
                                                    Mô tả dịch vụ:
                                                </span>
                                                <p className="mt-1 line-clamp-2 text-gray-500">
                                                    {item.service
                                                        ?.description ||
                                                        'Không có mô tả gốc.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Ghi chú từ TourService */}
                                        <div className="flex gap-2">
                                            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                            <div className="w-full rounded-md bg-amber-50 p-2">
                                                <span className="block text-xs font-semibold text-amber-700">
                                                    Ghi chú cho tour:
                                                </span>
                                                <p className="text-gray-700">
                                                    {item.description ||
                                                        'Không có ghi chú.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cột phải: Số liệu tài chính */}
                                    <div className="flex flex-col justify-center space-y-2 rounded-md bg-gray-50 p-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="flex items-center gap-1 text-gray-500">
                                                <Box className="h-3.5 w-3.5" />{' '}
                                                Số lượng:
                                            </span>
                                            <span className="font-medium">
                                                {item.quantity} {item.unit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="flex items-center gap-1 text-gray-500">
                                                <Tag className="h-3.5 w-3.5" />{' '}
                                                Đơn giá:
                                            </span>
                                            <span className="font-medium">
                                                {new Intl.NumberFormat(
                                                    'en-US',
                                                ).format(item.price_unit)}{' '}
                                                $
                                            </span>
                                        </div>
                                        <Separator className="my-1" />
                                        <div className="flex justify-between text-base">
                                            <span className="font-semibold text-gray-700">
                                                Thành tiền:
                                            </span>
                                            <span className="font-bold text-green-600">
                                                {new Intl.NumberFormat(
                                                    'en-US',
                                                ).format(item.price_total)}{' '}
                                                $
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Các nút Action (Tuyệt đối góc phải trên) */}
                                <div className="absolute top-4 right-4 flex gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                        onClick={() => onEdit(item)}
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => onDelete(item)}
                                        title="Xóa"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
