import { TourInfoCardsProps } from "@/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoItem } from "../helperInfoItem";
import { Clock, DollarSign, MapPin, Users } from "lucide-react";

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
                        <div className="flex flex-col gap-1">
                            <span>
                                Người lớn: {tour.price_adult?.toLocaleString()}{' '}
                                đ
                            </span>
                            <span>
                                Trẻ em: {tour.price_children?.toLocaleString()}{' '}
                                đ
                            </span>
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
                    value={`${tour.capacity || 'N/A'} người`}
                />
                <InfoItem
                    icon={<MapPin className="h-5 w-5 text-orange-600" />}
                    bg="bg-orange-100"
                    label="Địa điểm"
                    value={tour.destination || 'Đang cập nhật...'}
                />
            </CardContent>
        </Card>
    );
}
