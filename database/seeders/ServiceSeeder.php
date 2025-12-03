<?php

namespace Database\Seeders;

use App\Models\Provider;
use App\Models\Province;
use App\Models\Provinces;
use App\Models\Service;
use App\Models\ServiceAttribute;
use App\Models\ServiceType;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ServiceSeeder extends Seeder
{
    protected $faker;
    protected $types;

    // Danh sách dữ liệu mẫu cố định
    protected $vnAirlines = ['Vietnam Airlines', 'Vietjet Air', 'Bamboo Airways', 'Pacific Airlines', 'Vietravel Airlines'];
    protected $cnAirlines = ['China Southern Airlines', 'China Eastern Airlines'];
    protected $jpAirlines = ['Japan Airlines', 'All Nippon Airways'];
    protected $krAirlines = ['Korean Air', 'Asiana Airlines'];

    protected $vnTrains = ['Đường sắt Việt Nam (VNR)', 'Victoria Express', 'Livitrans Express', 'Violette Train'];

    protected $vnCarBrands = ['Nhà xe Phương Trang', 'Hãng xe Thành Bưởi', 'Xe Du lịch Việt', 'Mai Linh Express', 'Kumho Samco', 'Hà Sơn Hải Vân', 'Sao Việt'];

    protected $bigCorpHotels = ['Muong Thanh Luxury', 'Vinpearl Resort', 'Sheraton', 'InterContinental', 'Novotel', 'Melia', 'JW Marriott'];
    protected $haGiangHotels = ['Khách sạn Hoa Cương', 'Phoenix Hotel', 'Nhà nghỉ Cao Nguyên', 'Homestay Bụi', 'Nhà sàn Dân tộc'];

    protected $vnRestaurants = ['Nhà hàng Sen Tây Hồ', 'Cơm niêu Sài Gòn', 'Nhà hàng Biển Đông', 'Ẩm thực Xứ Quảng', 'Bún chả Hương Liên', 'Nét Huế', 'Madam Lân'];

    public function run(): void
    {
        $this->faker = Faker::create('vi_VN');

        // 1. Tạo 3 loại Service Type
        $this->types = [
            'transport' => ServiceType::firstOrCreate(
                ['name' => 'Vận chuyển'],
                [ 'description' => 'Xe, Máy bay, Tàu hỏa', 'order' => 1]
            ),
            'restaurant' => ServiceType::firstOrCreate(
                ['name' => 'Nhà hàng'],
                [ 'description' => 'Ăn uống, Tiệc', 'order' => 2]
            ),
            'hotel' => ServiceType::firstOrCreate(
                ['name' => 'Khách sạn'],
                [ 'description' => 'Lưu trú, Nghỉ dưỡng', 'order' => 3]
            ),
        ];

        // 2. Seed dữ liệu Nội địa
        $this->seedDomestic();

        // 3. Seed dữ liệu Quốc tế
        $this->seedInternational();
    }

    private function seedDomestic()
    {
        $configs = [
            'Hà Nội' => [
                'car' => ['count' => 2, 'types' => ['16 chỗ', '30 chỗ', '45 chỗ']],
                'hotel' => ['count' => 3, 'source' => 'big_corp'],
                'restaurant' => ['count' => 4]
            ],
            'Hải Phòng' => [
                'car' => ['count' => 2, 'types' => ['16 chỗ', '30 chỗ', '45 chỗ']],
                'train' => ['count' => 1],
                'hotel' => ['count' => 3, 'source' => 'big_corp'],
                'restaurant' => ['count' => 5]
            ],
            'Hà Giang' => [
                'car' => ['count' => 5, 'types' => ['16 chỗ', '30 chỗ', '45 chỗ', 'Giường nằm']],
                'hotel' => ['count' => 2, 'source' => 'local'], // Tên tiếng việt địa phương
                'restaurant' => ['count' => 2]
            ],
            'Khánh Hòa' => [ // Nha Trang
                'car' => ['count' => 4, 'types' => ['45 chỗ', 'Giường nằm']],
                'flight' => ['count' => 2, 'source' => 'vn'],
                'train' => ['count' => 2],
                'hotel' => ['count' => 5, 'source' => 'big_corp'],
                'restaurant' => ['count' => 6]
            ],
            'Thừa Thiên Huế' => [
                'car' => ['count' => 3, 'types' => ['45 chỗ', 'Giường nằm']],
                'flight' => ['count' => 2, 'source' => 'vn'],
                'train' => ['count' => 2],
                'hotel' => ['count' => 4, 'source' => 'big_corp'],
                'restaurant' => ['count' => 7]
            ],
        ];

        foreach ($configs as $provinceName => $config) {
            $province = Province::where('name', $provinceName)->first();
            if (!$province)
                continue;

            $this->command->info("Seeding services for Domestic: $provinceName");

            // Xe
            if (isset($config['car'])) {
                $this->createProviders($province->id, 'transport', $config['car']['count'], 'car', [
                    'car_types' => $config['car']['types']
                ]);
            }
            // Tàu
            if (isset($config['train'])) {
                $this->createProviders($province->id, 'transport', $config['train']['count'], 'train');
            }
            // Máy bay
            if (isset($config['flight'])) {
                $this->createProviders($province->id, 'transport', $config['flight']['count'], 'flight', [
                    'flight_source' => 'vn'
                ]);
            }
            // Khách sạn
            if (isset($config['hotel'])) {
                $this->createProviders($province->id, 'hotel', $config['hotel']['count'], 'hotel', [
                    'hotel_source' => $config['hotel']['source']
                ]);
            }
            // Nhà hàng
            if (isset($config['restaurant'])) {
                $this->createProviders($province->id, 'restaurant', $config['restaurant']['count'], 'restaurant');
            }
        }
    }

    private function seedInternational()
    {
        // Cấu hình nhóm tỉnh thành theo quốc gia để lấy đúng hãng bay
        $groups = [
            'CHN' => ['cities' => ['Bắc Kinh', 'Thượng Hải', 'Tứ Xuyên'], 'flight_source' => 'cn'],
            'JPN' => ['cities' => ['Tokyo', 'Kyoto', 'Osaka'], 'flight_source' => 'jp'],
            'KOR' => ['cities' => ['Seoul', 'Busan', 'Jeju'], 'flight_source' => 'kr'],
        ];

        foreach ($groups as $countryCode => $group) {
            foreach ($group['cities'] as $cityName) {
                $province = Province::where('name', $cityName)->first();
                if (!$province)
                    continue;

                $this->command->info("Seeding services for International: $cityName");

                // Cấu hình chung cho quốc tế: 2 bay, 5 nhà hàng, 5 khách sạn, 3 xe

                // 1. Máy bay (2 nhà cung cấp)
                $this->createProviders($province->id, 'transport', 2, 'flight', [
                    'flight_source' => $group['flight_source'],
                    'is_international' => true,
                    'city_name' => $cityName
                ]);

                // 2. Nhà hàng (5 nhà cung cấp - Tên Latin)
                $this->createProviders($province->id, 'restaurant', 5, 'restaurant', [
                    'is_international' => true,
                    'city_name' => $cityName
                ]);

                // 3. Khách sạn (5 nhà cung cấp - Tên Latin)
                $this->createProviders($province->id, 'hotel', 5, 'hotel', [
                    'is_international' => true,
                    'city_name' => $cityName
                ]);

                // 4. Xe (3 nhà cung cấp - 16, 30, 45 chỗ - Tên Latin)
                $this->createProviders($province->id, 'transport', 3, 'car', [
                    'is_international' => true,
                    'car_types' => ['16 chỗ', '30 chỗ', '45 chỗ'],
                    'city_name' => $cityName
                ]);
            }
        }
    }

    /**
     * Hàm tạo Provider và Services
     */
    private function createProviders($provinceId, $typeKey, $count, $subType, $options = [])
    {
        $faker = $this->faker;
        $typeId = $this->types[$typeKey]->id;
        $isInternational = $options['is_international'] ?? false;

        for ($i = 0; $i < $count; $i++) {
            // 1. TẠO PROVIDER
            $providerName = $this->generateProviderName($subType, $options);

            $provider = Provider::create([
                'province_id' => $provinceId,
                'name' => $providerName,
                'description' => $isInternational
                    ? "Top rated $subType provider in " . ($options['city_name'] ?? 'this city')
                    : "Nhà cung cấp dịch vụ $subType uy tín, chất lượng cao.",
                'email' => $faker->email,
                'hotline' => $faker->phoneNumber,
                'address' => $isInternational ? $faker->address : "Số " . rand(1, 999) . " đường trung tâm, " . ($options['city_name'] ?? 'Thành phố'),
                'website' => 'https://www.' . \Str::slug($providerName) . '.com',
                'status' => '1',
                'notes' => $isInternational ? 'International Partner' : 'Đối tác chiến lược',
            ]);

            // 2. TẠO SERVICES CHO PROVIDER ĐÓ
            $this->createServicesForProvider($provider, $typeId, $subType, $options);
        }
    }

    private function createServicesForProvider($provider, $typeId, $subType, $options)
    {
        $faker = $this->faker;
        $isInternational = $options['is_international'] ?? false;

        if ($subType === 'car') {
            $carTypes = $options['car_types'] ?? ['16 chỗ', '30 chỗ', '45 chỗ'];
            foreach ($carTypes as $carType) {
                Service::create([
                    'service_type_id' => $typeId,
                    'provider_id' => $provider->id,
                    'name' => $isInternational
                        ? "Rental Car $carType (Full Day)"
                        : "Thuê xe $carType - " . $provider->name,
                    'description' => "Xe đời mới, máy lạnh, tài xế kinh nghiệm.",
                    'price' => $faker->numberBetween(1500000, 6000000),
                    'type_car' => $carType,
                    'limit' => 5,
                    'unit' => 'xe'
                ]);
            }
        } elseif ($subType === 'hotel') {
            $rooms = $isInternational
                ? ['Standard Room', 'Deluxe City View', 'Executive Suite']
                : ['Phòng Tiêu chuẩn', 'Phòng Hạng sang', 'Phòng Tổng thống'];

            foreach ($rooms as $room) {
                Service::create([
                    'service_type_id' => $typeId,
                    'provider_id' => $provider->id,
                    'name' => $room,
                    'description' => "Phòng đầy đủ tiện nghi, bao gồm ăn sáng.",
                    'price' => $faker->numberBetween(800000, 5000000),
                    'type_room' => $room,
                    'limit' => rand(10, 50),
                    'unit' => 'phòng'
                ]);
            }
        } elseif ($subType === 'restaurant') {
            $menus = $isInternational
                ? ['Traditional Set Menu', 'Seafood Buffet', 'Premium BBQ']
                : ['Cơm đoàn thực đơn 150k', 'Cơm đoàn thực đơn 250k', 'Tiệc Gala Dinner'];

            foreach ($menus as $menu) {
                Service::create([
                    'service_type_id' => $typeId,
                    'provider_id' => $provider->id,
                    'name' => $menu,
                    'description' => "Thực đơn phong phú, đảm bảo vệ sinh ATTP.",
                    'price' => $faker->numberBetween(150000, 800000),
                    'type_meal' => 'Set Menu',
                    'limit' => 200,
                    'unit' => 'Suất'
                ]);
            }
        } elseif ($subType === 'flight' || $subType === 'train') {
            $tickets = ($subType === 'flight')
                ? ['Economy Class', 'Business Class']
                : ['Soft Seat (Ghế mềm)', 'Sleeper Cabin (Giường nằm)'];

            foreach ($tickets as $ticket) {
                $price = ($subType === 'flight')
                    ? $faker->numberBetween(2000000, 20000000)
                    : $faker->numberBetween(500000, 2000000);

                $service = Service::create([
                    'service_type_id' => $typeId,
                    'provider_id' => $provider->id,
                    'name' => "$ticket - " . ($isInternational ? "International" : "Domestic"),
                    'description' => "Vé một chiều, đã bao gồm thuế phí.",
                    'price' => $price,
                    'limit' => 50,
                    'unit' => 'Vé'
                ]);

                // Tạo thuộc tính (Attribute)
                $this->seedAttributes($service->id, $subType, $ticket, $isInternational);
            }
        }
    }

    private function seedAttributes($serviceId, $type, $ticketName, $isInternational)
    {
        $attrs = [];
        if ($type === 'flight') {
            $attrs[] = ['name' => 'Loại chuyến bay', 'value' => $isInternational ? 'Quốc tế' : 'Nội địa', 'type' => 'text'];
            $attrs[] = ['name' => 'Hạng vé', 'value' => str_contains($ticketName, 'Business') ? 'Thương gia' : 'Phổ thông', 'type' => 'select'];
            $attrs[] = ['name' => 'Hành lý xách tay', 'value' => '7kg', 'type' => 'text'];
            $attrs[] = ['name' => 'Hành lý ký gửi', 'value' => '23kg', 'type' => 'text'];
            $attrs[] = ['name' => 'Hoàn hủy', 'value' => 'Có tính phí', 'type' => 'text'];
        } elseif ($type === 'train') {
            $attrs[] = ['name' => 'Loại tàu', 'value' => 'Cao tốc/Thống Nhất', 'type' => 'text'];
            $attrs[] = ['name' => 'Toa', 'value' => str_contains($ticketName, 'Sleeper') ? 'Toa giường nằm' : 'Toa ngồi mềm', 'type' => 'text'];
            $attrs[] = ['name' => 'Điều hòa', 'value' => 'Có', 'type' => 'boolean'];
        }

        foreach ($attrs as $attr) {
            ServiceAttribute::create([
                'service_id' => $serviceId,
                'name' => $attr['name'],
                'value' => $attr['value'],
                'type' => $attr['type']
            ]);
        }
    }

    private function generateProviderName($subType, $options)
    {
        $isInternational = $options['is_international'] ?? false;

        if ($isInternational) {
            $city = $options['city_name'] ?? 'City';
            if ($subType === 'flight') {
                $source = $options['flight_source'] ?? 'vn';
                $list = match ($source) {
                    'cn' => $this->cnAirlines,
                    'jp' => $this->jpAirlines,
                    'kr' => $this->krAirlines,
                    default => $this->vnAirlines
                };
                return $list[array_rand($list)];
            }
            if ($subType === 'hotel')
                return "$city Grand Hotel & Spa";
            if ($subType === 'restaurant')
                return "$city Traditional Cuisine";
            if ($subType === 'car')
                return "$city Transport Service";
            return "$city Service Provider";
        }

        // Nội địa
        if ($subType === 'flight') {
            return $this->vnAirlines[array_rand($this->vnAirlines)];
        }
        if ($subType === 'train') {
            return $this->vnTrains[array_rand($this->vnTrains)];
        }
        if ($subType === 'car') {
            return $this->vnCarBrands[array_rand($this->vnCarBrands)];
        }
        if ($subType === 'hotel') {
            $source = $options['hotel_source'] ?? 'big_corp';
            $list = ($source === 'local') ? $this->haGiangHotels : $this->bigCorpHotels;
            return $list[array_rand($list)];
        }
        if ($subType === 'restaurant') {
            return $this->vnRestaurants[array_rand($this->vnRestaurants)];
        }

        return 'Nhà cung cấp dịch vụ';
    }
}