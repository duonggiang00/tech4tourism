
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoItem } from "../helperInfoItem";
import { Calendar, Clock, DollarSign, MapPin, Users } from "lucide-react";
import { TourInfoCardsProps } from "@/types";

interface TourInstance {
    id: number;
    price_adult: number | null;
    price_children: number | null;
}

interface TourInfoCardsExtendedProps extends TourInfoCardsProps {
    instances?: TourInstance[];
}

export default function TourInfoCards({ tour, instances }: TourInfoCardsExtendedProps) {
    // Lấy giá từ instance đầu tiên (nếu có), nếu không thì từ tour (backward compatibility)
    const firstInstance = instances && instances.length > 0 ? instances[0] : null;
    const priceAdult = firstInstance?.price_adult ?? tour.price_adult ?? null;
    const priceChildren = firstInstance?.price_children ?? tour.price_children ?? null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Thông tin Tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <InfoItem
                    icon={<DollarSign className="h-5 w-5 text-blue-600" />}
                    bg="bg-blue-100"
                    label="Giá vé"
                    value={
                        <div>
                            {priceAdult !== null || priceChildren !== null ? (
                                <>
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="text-left">Người lớn:</div>
                                        <div className="text-right">
                                            {priceAdult !== null ? (
                                                new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(priceAdult)
                                            ) : (
                                                <span className="text-gray-400">Chưa có giá</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="text-left">Trẻ em:</div>
                                        <div className="text-right">
                                            {priceChildren !== null ? (
                                                new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(priceChildren)
                                            ) : (
                                                <span className="text-gray-400">Chưa có giá</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500">
                                    Chưa có chuyến đi nào. Vui lòng tạo chuyến đi để hiển thị giá.
                                </div>
                            )}
                        </div>
                    }
                />
                <InfoItem
                    icon={<Clock className="h-5 w-5 text-purple-600" />}
                    bg="bg-purple-100"
                    label="Thời gian"
                    value={`${tour.day} ngày / ${tour.night} đêm`}
                />
                <InfoItem
                    icon={<Users className="h-5 w-5 text-green-600" />}
                    bg="bg-green-100"
                    label="Sức chứa"
                    value={`${tour.limit || 'N/A'} người`}
                />
                <InfoItem
                    icon={<MapPin className="h-5 w-5 text-orange-600" />}
                    bg="bg-orange-100"
                    label="Địa điểm"
                    value={tour.province.name || 'Đang cập nhật...'}
                />
                <InfoItem
                    icon={<Calendar className="h-5 w-5 text-blue-600" />}
                    bg="bg-blue-100"
                    label="Thời gian"
                    // Thay đổi ở đây: Truyền vào một thẻ div chứa 2 dòng thay vì cộng chuỗi
                    value={
                        tour.date_start && tour.date_end ? (
                            <div className="flex flex-col">
                                <span>Khởi hành: {tour.date_start}</span>
                                <span>Kết thúc: {tour.date_end}</span>
                            </div>
                        ) : (
                            'Đang cập nhật...'
                        )
                    }
                />
            </CardContent>
        </Card>
    );
}
