
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import tourUrl from '@/routes/tours';
import { TourHeaderProps } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function TourHeader({
    tour,
    categoryName,
    onEdit,
    onDelete,
}: TourHeaderProps) {
    const getStatusInfo = (status: number) => {
        switch (status) {
            case 0:
                return {
                    label: 'Hoạt động',
                    color: 'bg-green-100 text-green-800',
                };
            case 1:
                return {
                    label: 'Không hoạt động',
                    color: 'bg-gray-100 text-gray-800',
                };
            case 2:
                return { label: 'Sắp có', color: 'bg-blue-100 text-blue-800' };
            default:
                return { label: 'N/A', color: 'bg-gray-100 text-gray-800' };
        }
    };
    const status = getStatusInfo(tour.status);

    return (
        <div className="mb-6">
            <Button
                variant="ghost"
                onClick={() => router.visit(tourUrl.index().url)}
                className="mb-4 pl-0 hover:text-blue-600"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {tour.title}
                        </h2>
                        <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <h4 className="text-gray-400">
                        {categoryName || 'Chưa phân loại'}
                    </h4>
                </div>
                <div className="flex gap-2">
                    <Link href={tourUrl.edit(tour.id).url}>
                        <Button variant="outline">
                            <Pencil className="mr-2 h-4 w-4" /> Sửa
                        </Button>
                    </Link>

                    <Button variant="destructive" onClick={onDelete}>
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa
                    </Button>
                </div>
            </div>
        </div>
    );
}
