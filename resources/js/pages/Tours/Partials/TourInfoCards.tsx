
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoItem } from "../helperInfoItem";
import { Calendar, Clock, DollarSign, MapPin, Users } from "lucide-react";
import { TourInfoCardsProps } from "@/types";

export default function TourInfoCards({ tour }: TourInfoCardsProps) {
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
                            <div className="grid grid-cols-2 gap-1">
                                <div className="text-left">Người lớn:</div>
                                <div className="text-right">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(tour.price_adult ?? 0)}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <div className="text-left">Trẻ em:</div>
                                <div className="text-right">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(tour.price_children ?? 0)}
                                </div>
                            </div>
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
