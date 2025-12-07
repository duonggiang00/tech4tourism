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
    Trash2,
} from 'lucide-react';

interface Props {
    tourServices: TourService[];
    onAdd?: () => void;
    onEdit?: (item: TourService) => void;
    onDelete?: (item: TourService) => void;
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
                {onAdd && (
                    <Button size="sm" variant="outline" onClick={onAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm mới
                    </Button>
                )}
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

                                {/* Nội dung chi tiết - Xếp dọc 1 cột */}
                                <div className="space-y-3 text-sm">
                                    {/* 1. Số lượng */}
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Box className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium">
                                            Số lượng: {item.quantity}{' '}
                                            {item.unit}
                                        </span>
                                    </div>

                                    {/* 2. Mô tả */}
                                    <div className="flex gap-2">
                                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                        <div>
                                            <span className="mr-2 font-medium text-gray-600">
                                                Mô tả:
                                            </span>
                                            <span className="text-gray-500">
                                                {item.service?.description ||
                                                    'Không có mô tả.'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3. Ghi chú (nếu có) */}
                                    <div className="flex gap-2">
                                        <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                        <div className="w-full">
                                            <span className="mr-2 font-medium text-gray-600">
                                                Ghi chú:
                                            </span>
                                            <span className="text-gray-700 italic">
                                                {item.description ||
                                                    'Không có ghi chú.'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Các nút Action (Tuyệt đối góc phải trên) */}
                                <div className="absolute top-4 right-4 flex gap-1">
                                    {onEdit && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                            onClick={() => onEdit(item)}
                                            title="Chỉnh sửa"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                            onClick={() => onDelete(item)}
                                            title="Xóa"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
