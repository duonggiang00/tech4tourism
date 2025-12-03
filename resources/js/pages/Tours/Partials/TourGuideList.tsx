import { TripAssignment } from '@/app';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, UserCheck } from 'lucide-react';

interface Props {
    assignments: TripAssignment[];
    onAdd: () => void;
    onDelete: (id: number) => void;
}

// Helper để hiển thị trạng thái đẹp hơn
const getStatusBadge = (status: string) => {
    switch (status) {
        case '0':
            return (
                <Badge
                    variant="outline"
                    className="border-yellow-600 text-yellow-600"
                >
                    Chờ
                </Badge>
            );
        case '1':
            return <Badge className="bg-green-600">Hoạt động</Badge>;
        case '2':
            return <Badge variant="secondary">Hoàn thành</Badge>;
        case '3':
            return <Badge variant="destructive">Đã hủy</Badge>;
        default:
            return <Badge variant="outline">N/A</Badge>;
    }
};

export default function GuideList({ assignments, onAdd, onDelete }: Props) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    Hướng dẫn viên ({assignments.length})
                </CardTitle>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onAdd}
                    className="h-8 text-xs"
                >
                    + Thêm
                </Button>
            </CardHeader>
            <CardContent>
                {assignments.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500 italic">
                        Chưa có hướng dẫn viên nào.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {assignments.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            src={`https://ui-avatars.com/api/?name=${item.user?.name}`}
                                        />
                                        <AvatarFallback>GV</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {item.user?.name || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.user?.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(item.status)}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => onDelete(item.id)}
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
