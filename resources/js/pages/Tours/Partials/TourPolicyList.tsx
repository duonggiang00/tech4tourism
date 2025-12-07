import { TourPolicy } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import policies from '@/routes/policies';
import { Link } from '@inertiajs/react';
import { Eye, Plus, ShieldCheck, Trash2 } from 'lucide-react';

interface Props {
    tourPolicies: TourPolicy[];
    onAdd?: () => void;
    // Đã xóa onEdit vì không dùng nữa
    onDelete?: (item: TourPolicy) => void;
}

export default function TourPolicyList({
    tourPolicies,
    onAdd,
    onDelete,
}: Props) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    Chính sách Tour ({tourPolicies.length})
                </CardTitle>
                {onAdd && (
                    <Button size="sm" variant="outline" onClick={onAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Thêm mới
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {tourPolicies.length === 0 ? (
                    <div className="rounded-md border border-dashed py-8 text-center text-sm text-gray-500">
                        Chưa có chính sách nào được thiết lập cho tour này.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tourPolicies.map((item) => (
                            <div
                                key={item.id}
                                className="group relative flex flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                            >
                                {/* Tiêu đề chính sách */}
                                <div className="flex items-center justify-between pr-20">
                                    <h4 className="font-bold text-gray-800">
                                        {item.policy?.title ||
                                            'Chính sách không xác định'}
                                    </h4>
                                </div>

                                {/* Nút thao tác */}
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    {/* Nút Xem chi tiết (Thay thế nút Sửa) */}
                                    <Link href={policies.show(item.policy_id)}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                            title="Xem chi tiết chính sách gốc"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    {onDelete && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                            onClick={() => onDelete(item)}
                                            title="Xóa khỏi tour"
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
