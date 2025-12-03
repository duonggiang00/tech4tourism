<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\Destination;

use App\Models\Province; // Hoặc Provinces tùy vào tên model của bạn

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Tạo Quốc Gia
        $countries = [
            ['name' => 'Việt Nam', 'code' => 'VNM', 'description' => 'Đất nước hình chữ S xinh đẹp.'],
            ['name' => 'Trung Quốc', 'code' => 'CHN', 'description' => 'Đất nước tỷ dân với bề dày lịch sử.'],
            ['name' => 'Nhật Bản', 'code' => 'JPN', 'description' => 'Xứ sở hoa anh đào.'],
            ['name' => 'Hàn Quốc', 'code' => 'KOR', 'description' => 'Xứ sở kim chi.'],
        ];

        foreach ($countries as $c) {
            Country::firstOrCreate(['code' => $c['code']], $c);
        }

        // Lấy ID các nước để dùng bên dưới
        $vnId = Country::where('code', 'VNM')->value('id');
        $cnId = Country::where('code', 'CHN')->value('id');
        $jpId = Country::where('code', 'JPN')->value('id');
        $krId = Country::where('code', 'KOR')->value('id');

        // 2. Tạo 34 Tỉnh Thành Việt Nam
        // Trong đó có 5 tỉnh/thành phố bạn yêu cầu cụ thể: Hà Nội, Hải Phòng, Hà Giang, Khánh Hòa (Nha Trang), Thừa Thiên Huế (Huế)
        $vnProvinces = [
            'Hà Nội',
            'Hồ Chí Minh',
            'Hải Phòng',
            'Đà Nẵng',
            'Cần Thơ',
            'Hà Giang',
            'Cao Bằng',
            'Lào Cai',
            'Điện Biên',
            'Sơn La',
            'Quảng Ninh',
            'Ninh Bình',
            'Thanh Hóa',
            'Nghệ An',
            'Quảng Bình',
            'Thừa Thiên Huế',
            'Quảng Nam',
            'Khánh Hòa',
            'Lâm Đồng',
            'Bình Thuận', // Khánh Hòa chứa Nha Trang, Thừa Thiên Huế chứa Huế
            'Bà Rịa - Vũng Tàu',
            'Tây Ninh',
            'Bình Dương',
            'Đồng Nai',
            'Long An',
            'Tiền Giang',
            'Bến Tre',
            'Vĩnh Long',
            'Đồng Tháp',
            'An Giang',
            'Kiên Giang',
            'Cà Mau',
            'Bạc Liêu',
            'Sóc Trăng'
        ];

        foreach ($vnProvinces as $name) {
            Province::firstOrCreate(
                ['name' => $name, 'country_id' => $vnId],
                ['description' => "Tỉnh/Thành phố $name, Việt Nam"]
            );
        }

        // 3. Tạo dữ liệu địa điểm mẫu cho 5 tỉnh trọng điểm của VN
        // Map tên tỉnh trong DB với danh sách địa điểm
        $vnSpecialDestinations = [
            'Hà Nội' => [
                'Hồ Hoàn Kiếm',
                'Lăng Chủ tịch Hồ Chí Minh',
                'Văn Miếu Quốc Tử Giám',
                'Hoàng Thành Thăng Long',
                'Chùa Một Cột'
            ],
            'Hải Phòng' => [
                'Bãi biển Đồ Sơn',
                'Đảo Cát Bà',
                'Vịnh Lan Hạ',
                'Tuyệt Tình Cốc',
                'Bạch Đằng Giang'
            ],
            'Hà Giang' => [
                'Đèo Mã Pí Lèng',
                'Cao nguyên đá Đồng Văn',
                'Cột cờ Lũng Cú',
                'Sông Nho Quế',
                'Dinh Vua Mèo'
            ],
            'Khánh Hòa' => [ // Nha Trang thuộc Khánh Hòa
                'VinWonders Nha Trang',
                'Tháp Bà Ponagar',
                'Đảo Hòn Mun',
                'Viện Hải dương học',
                'Chùa Long Sơn'
            ],
            'Thừa Thiên Huế' => [ // Huế thuộc Thừa Thiên Huế
                'Đại Nội Huế',
                'Chùa Thiên Mụ',
                'Lăng Khải Định',
                'Lăng Tự Đức',
                'Sông Hương'
            ]
        ];

        foreach ($vnSpecialDestinations as $provinceName => $destinations) {
            $province = Province::where('name', $provinceName)->where('country_id', $vnId)->first();
            if ($province) {
                foreach ($destinations as $destName) {
                    $this->createDestination($province->id, $destName);
                }
            }
        }

        // 4. Tạo Tỉnh và Địa điểm cho Quốc tế

        // --- Trung Quốc ---
        $cnLocations = [
            'Bắc Kinh' => ['Vạn Lý Trường Thành', 'Tử Cấm Thành', 'Di Hòa Viên', 'Thiên Đàn', 'Sân vận động Tổ Chim'],
            'Thượng Hải' => ['Bến Thượng Hải', 'Tháp truyền hình Minh Châu Phương Đông', 'Dự Viên', 'Phố Nam Kinh', 'Disneyland Thượng Hải'],
            'Tứ Xuyên' => ['Cửu Trại Câu', 'Khu bảo tồn Gấu Trúc', 'Núi Nga Mi', 'Tượng Lạc Sơn Đại Phật', 'Hoàng Long'],
        ];
        $this->seedInternational($cnId, $cnLocations);

        // --- Nhật Bản ---
        $jpLocations = [
            'Tokyo' => ['Tháp Tokyo', 'Đền Senso-ji', 'Giao lộ Shibuya', 'Cung điện Hoàng gia', 'Công viên Ueno'],
            'Kyoto' => ['Chùa Vàng (Kinkaku-ji)', 'Rừng tre Arashiyama', 'Đền Fushimi Inari', 'Chùa Thanh Thủy', 'Phố cổ Gion'],
            'Osaka' => ['Lâu đài Osaka', 'Phố Dotonbori', 'Universal Studios Japan', 'Thủy cung Kaiyukan', 'Tòa nhà Umeda Sky'],
        ];
        $this->seedInternational($jpId, $jpLocations);

        // --- Hàn Quốc ---
        $krLocations = [
            'Seoul' => ['Cung điện Gyeongbokgung', 'Tháp Namsan', 'Làng cổ Bukchon Hanok', 'Khu mua sắm Myeongdong', 'Công viên Lotte World'],
            'Busan' => ['Bãi biển Haeundae', 'Làng văn hóa Gamcheon', 'Chùa Haedong Yonggungsa', 'Tháp Busan', 'Chợ cá Jagalchi'],
            'Jeju' => ['Núi Hallasan', 'Đỉnh núi Seongsan Ilchulbong', 'Hang động Manjanggul', 'Thác Cheonjeyeon', 'Bảo tàng Teddy Bear'],
        ];
        $this->seedInternational($krId, $krLocations);
    }

    /**
     * Hàm hỗ trợ tạo địa điểm
     */
    private function createDestination($provinceId, $name)
    {
        // Giả sử Model tên là Destinations (theo DBML của bạn)
        // Nếu model tên Destination (số ít), hãy sửa lại ở dòng use trên cùng
        Destination::firstOrCreate(
            ['name' => $name, 'province_id' => $provinceId],
            [
                'description' => "Điểm du lịch nổi tiếng tại $name.",
                'address' => "Địa chỉ chi tiết của $name",
                'status' => '1',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Hàm hỗ trợ seed quốc tế
     */
    private function seedInternational($countryId, $data)
    {
        foreach ($data as $provName => $dests) {
            // Tạo tỉnh
            $province = Province::firstOrCreate(
                ['name' => $provName, 'country_id' => $countryId],
                ['description' => "Tỉnh/Thành phố $provName"]
            );

            // Tạo địa điểm
            foreach ($dests as $destName) {
                $this->createDestination($province->id, $destName);
            }
        }
    }
}