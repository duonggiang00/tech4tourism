import { TourScheduleListProps } from "@/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MapIcon, Pencil, Plus, Trash2 } from "lucide-react";

export default function TourScheduleList({
    schedules,
    onAdd,
    onEdit,
    onDelete,
}: TourScheduleListProps) {
    console.log(schedules);
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MapIcon className="h-5 w-5 text-blue-600" /> Lịch trình
                </CardTitle>
                {/* <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={onAdd}
                >
                    <Plus className="h-3.5 w-3.5" /> Thêm
                </Button> */}
            </CardHeader>
            <CardContent>
                {schedules.length > 0 ? (
                    <div className="relative ml-3 space-y-8 border-l-2 border-blue-100 py-2">
                        {schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="group relative pl-6"
                            >
                                <div className="absolute top-1 -left-[9px] h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>
                                {/* <div className="absolute top-0 right-0 hidden gap-2 rounded-md bg-white/80 p-1 backdrop-blur-sm group-hover:flex">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => onEdit(schedule)}
                                    >
                                        <Pencil className="h-3.5 w-3.5 text-blue-600" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => onDelete(schedule)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                    </Button>
                                </div> */}
                                <h4 className="mb-1 text-sm font-bold text-gray-900">
                                    Ngày {schedule.date}: {schedule.name}
                                </h4>
                                <p className="line-clamp-3 text-sm leading-relaxed whitespace-pre-line text-gray-600">
                                    {schedule.destination?.name ||
                                        'Chưa cập nhật địa điểm'}
                                </p>
                                <p className="line-clamp-3 text-sm leading-relaxed whitespace-pre-line text-gray-600">
                                    {schedule.description}
                                </p>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-sm text-gray-500 italic">
                        Chưa có lịch trình nào.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
