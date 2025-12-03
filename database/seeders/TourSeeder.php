<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Country;
use App\Models\Destination;
use App\Models\Policy;
use App\Models\Province;
use App\Models\Service;
use App\Models\Tour;
use App\Models\TourImages;
use App\Models\TourPolicy;
use App\Models\TourSchedule;
use App\Models\TourService;
use App\Models\TripAssignment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TourSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('vi_VN');

        // 1. Lấy ID của các Danh mục
        $catInt = Category::where('title', 'like', '%Quốc tế%')->value('id');
        $catDom = Category::where('title', 'like', '%Nội địa%')->value('id');
        $catCus = Category::where('title', 'like', '%tùy chọn%')->value('id');

        if (!$catInt || !$catDom) {
            $this->command->info('Vui lòng chạy CategorySeeder trước!');
            return;
        }

        // 2. Lấy ID các Quốc gia
        $vnId = Country::where('code', 'VNM')->value('id');
        $foreignIds = Country::whereIn('code', ['CHN', 'JPN', 'KOR'])->pluck('id');

        // 3. Lấy danh sách Tỉnh thành, Users và Policies
        $foreignProvinces = Province::whereIn('country_id', $foreignIds)
            ->with(['destinations', 'providers.services.serviceType'])
            ->get();

        $vnProvinces = Province::where('country_id', $vnId)
            ->with(['destinations', 'providers.services.serviceType'])
            ->get();

        $guides = User::where('role', 1)->get();
        if ($guides->isEmpty()) {
            $guides = User::limit(10)->get();
        }

        // Lấy tất cả chính sách (Đảm bảo PolicySeeder đã chạy)
        $policies = Policy::all();

        // --- HÀM TẠO DỮ LIỆU LIÊN KẾT ---
        $createRelatedData = function ($tour, $province, $days) use ($faker, $guides, $policies) {

            // A. Tạo Tour Images (3-5 ảnh)
            for ($j = 0; $j < rand(3, 5); $j++) {
                TourImages::create([
                    'tour_id' => $tour->id,
                    'img_url' => 'tours/gallery_' . rand(1, 10) . '.jpg',
                    'alt' => $tour->title . ' - Ảnh ' . ($j + 1),
                    'order' => $j + 1,
                ]);
            }

            // B. Tạo Tour Schedules (Lịch trình theo ngày)
            $destinations = $province->destinations;
            if ($destinations->isNotEmpty()) {
                for ($d = 1; $d <= $days; $d++) {
                    $dest = $destinations->random();
                    TourSchedule::create([
                        'tour_id' => $tour->id,
                        'destination_id' => $dest->id,
                        'name' => "Ngày $d: Khám phá " . $dest->name,
                        'description' => $faker->paragraph(2),
                        'date' => $d,
                    ]);
                }
            }

            // C. Tạo Tour Services (Dịch vụ đi kèm)
            $allServices = collect();
            if ($province->providers) {
                foreach ($province->providers as $provider) {
                    if ($provider->services) {
                        $allServices = $allServices->merge($provider->services);
                    }
                }
            }

            if ($allServices->isNotEmpty()) {
                $servicesToCreate = collect();

                // 1. Xử lý Vận chuyển
                $transportServices = $allServices->filter(fn($s) => optional($s->serviceType)->name === 'Vận chuyển');
                if ($transportServices->isNotEmpty()) {
                    $transport = $transportServices->random();
                    $capacity = 45;
                    $carType = $transport->type_car ?? $transport->name;

                    if (preg_match('/(\d+)\s*(chỗ|seat)/iu', $carType, $matches)) {
                        $capacity = (int) $matches[1];
                    } elseif (stripos($carType, 'Giường nằm') !== false || stripos($carType, 'Sleeper') !== false) {
                        $capacity = 40;
                    } elseif (stripos($carType, 'Cabin') !== false) {
                        $capacity = 22;
                    }

                    $qty = ceil($tour->limit / $capacity);
                    $servicesToCreate->push([
                        'service' => $transport,
                        'qty' => $qty,
                        'note' => "Xe $capacity chỗ cho đoàn {$tour->limit} khách"
                    ]);
                }

                // 2. Xử lý Khách sạn
                $hotelServices = $allServices->filter(fn($s) => optional($s->serviceType)->name === 'Khách sạn');
                if ($hotelServices->isNotEmpty()) {
                    $hotel = $hotelServices->random();
                    $qty = ceil($tour->limit / 2);
                    $servicesToCreate->push([
                        'service' => $hotel,
                        'qty' => $qty,
                        'note' => "Phòng tiêu chuẩn (2 khách/phòng)"
                    ]);
                }

                // 3. Xử lý Nhà hàng
                $restaurantServices = $allServices->filter(fn($s) => optional($s->serviceType)->name === 'Nhà hàng');
                if ($restaurantServices->isNotEmpty()) {
                    $restaurant = $restaurantServices->random();
                    $qty = $tour->limit;
                    $servicesToCreate->push([
                        'service' => $restaurant,
                        'qty' => $qty,
                        'note' => "Suất ăn theo đoàn"
                    ]);
                }

                foreach ($servicesToCreate as $item) {
                    $srv = $item['service'];
                    $qty = $item['qty'];
                    $price = $srv->price ?? 100000;

                    TourService::create([
                        'tour_id' => $tour->id,
                        'service_id' => $srv->id,
                        'quantity' => $qty,
                        'unit' => $srv->unit ?? 'Lần',
                        'price_unit' => $price,
                        'price_total' => $qty * $price,
                        'description' => $item['note'],
                    ]);
                }
            }

            // D. Tạo Trip Assignment (Phân công HDV)
            if ($guides->isNotEmpty()) {
                TripAssignment::create([
                    'tour_id' => $tour->id,
                    'user_id' => $guides->random()->id,
                    'status' => $faker->randomElement(['0', '1', '2', '3']),
                ]);
            }

            // E. Tạo Tour Policy (Gắn TOÀN BỘ chính sách) - ĐÃ SỬA
            if ($policies->isNotEmpty()) {
                // Lặp qua tất cả chính sách và gắn vào tour
                foreach ($policies as $policy) {
                    TourPolicy::create([
                        'tour_id' => $tour->id,
                        'policy_id' => $policy->id,
                    ]);
                }
            }
        };

        // --- A. TẠO 15 TOUR QUỐC TẾ ---
        $this->command->info('Đang tạo 15 Tour Quốc tế...');
        for ($i = 0; $i < 15; $i++) {
            $province = $foreignProvinces->random();
            $days = rand(4, 7);
            $nights = $days - 1;
            $startDate = Carbon::now()->addDays(rand(10, 60));

            $titles = [
                "Khám phá vẻ đẹp {$province->name}",
                "Hành trình di sản {$province->name} - Mùa lá đỏ",
                "Tour cao cấp {$province->name} {$days}N{$nights}Đ",
                "Trải nghiệm văn hóa tại {$province->name}",
                "Kỳ nghỉ dưỡng tuyệt vời tại {$province->name}"
            ];

            $tour = Tour::create([
                'category_id' => $catInt,
                'province_id' => $province->id,
                'title' => $faker->unique()->randomElement($titles) . ' ' . rand(1, 1000),
                'status' => 1,
                'day' => $days,
                'night' => $nights,
                'date_start' => $startDate->format('Y-m-d'),
                'date_end' => $startDate->copy()->addDays($days)->format('Y-m-d'),
                'limit' => rand(15, 30),
                'thumbnail' => 'tours/sample_international_' . rand(1, 5) . '.jpg',
                'description' => $this->generateDescription($province->name, $days),
                'short_description' => "Chuyến đi {$days} ngày {$nights} đêm khám phá những địa danh nổi tiếng nhất tại {$province->name}.",
                'price_adult' => rand(15000000, 40000000),
                'price_children' => rand(10000000, 30000000),
            ]);

            $createRelatedData($tour, $province, $days);
        }

        // --- B. TẠO 20 TOUR NỘI ĐỊA ---
        $this->command->info('Đang tạo 20 Tour Nội địa...');
        for ($i = 0; $i < 20; $i++) {
            $province = $vnProvinces->random();
            $destName = $province->destinations->isNotEmpty() ? $province->destinations->random()->name : $province->name;

            $days = rand(2, 5);
            $nights = $days - 1;
            $startDate = Carbon::now()->addDays(rand(5, 30));

            $titles = [
                "Du lịch {$province->name}: Khám phá {$destName}",
                "Tour {$province->name} giá tốt {$days}N{$nights}Đ",
                "Nghỉ dưỡng cuối tuần tại {$province->name}",
                "Săn mây và trải nghiệm {$province->name}",
                "Hành trình biển đảo: {$destName} - {$province->name}"
            ];

            $tour = Tour::create([
                'category_id' => $catDom,
                'province_id' => $province->id,
                'title' => $faker->unique()->randomElement($titles) . ' ' . rand(1, 1000),
                'status' => 1,
                'day' => $days,
                'night' => $nights,
                'date_start' => $startDate->format('Y-m-d'),
                'date_end' => $startDate->copy()->addDays($days)->format('Y-m-d'),
                'limit' => rand(20, 45),
                'thumbnail' => 'tours/sample_vietnam_' . rand(1, 5) . '.jpg',
                'description' => $this->generateDescription($province->name, $days),
                'short_description' => "Cùng trải nghiệm vẻ đẹp của {$province->name} với lịch trình hấp dẫn và chi phí hợp lý.",
                'price_adult' => rand(2000000, 8000000),
                'price_children' => rand(1000000, 5000000),
            ]);

            $createRelatedData($tour, $province, $days);
        }

        // --- C. TẠO 5 TOUR TÙY CHỌN ---
        $this->command->info('Đang tạo 5 Tour Tùy chọn...');
        $allProvinces = $vnProvinces->merge($foreignProvinces);

        for ($i = 0; $i < 5; $i++) {
            $province = $allProvinces->random();
            $days = rand(3, 10);
            $startDate = Carbon::now()->addDays(rand(15, 45));

            $tour = Tour::create([
                'category_id' => $catCus,
                'province_id' => $province->id,
                'title' => "Tour thiết kế riêng: {$province->name} - VIP " . rand(1, 100),
                'status' => 2, // Sắp ra mắt
                'day' => $days,
                'night' => $days - 1,
                'date_start' => $startDate->format('Y-m-d'),
                'date_end' => $startDate->copy()->addDays($days)->format('Y-m-d'),
                'limit' => rand(5, 10),
                'thumbnail' => 'tours/sample_custom.jpg',
                'description' => "<p>Đây là tour được thiết kế đặc biệt theo yêu cầu của khách hàng VIP.</p>",
                'short_description' => "Trải nghiệm đẳng cấp, lịch trình linh hoạt theo yêu cầu.",
                'price_adult' => rand(50000000, 100000000),
                'price_children' => rand(30000000, 70000000),
            ]);

            $createRelatedData($tour, $province, $days);
        }
    }

    private function generateDescription($locationName, $days)
    {
        return "
            <h3>Lịch trình tóm tắt khám phá $locationName</h3>
            <p>Chào mừng bạn đến với hành trình $days ngày tuyệt vời tại $locationName. Dưới đây là những điểm nổi bật:</p>
            <ul>
                <li>Tham quan các danh lam thắng cảnh nổi tiếng.</li>
                <li>Thưởng thức ẩm thực địa phương đặc sắc.</li>
                <li>Nghỉ ngơi tại khách sạn tiêu chuẩn 4-5 sao.</li>
                <li>Có hướng dẫn viên chuyên nghiệp suốt tuyến.</li>
            </ul>
            <p><em>Lưu ý: Lịch trình có thể thay đổi tùy theo điều kiện thời tiết thực tế.</em></p>
        ";
    }
}