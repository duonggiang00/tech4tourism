<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DestinationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        DB::table('destinations')->insert([
            [
                'id_province' => 1,
                'name' => 'K9 Núi Đá Chông',
                'description' => 'K9 Đá Chông là một khu di tích lịch sử quan trọng tại huyện Ba Vì, Hà Nội, nơi từng là địa điểm làm việc, nghỉ ngơi bí mật của Chủ tịch Hồ Chí Minh và là nơi gìn giữ thi hài của Người từ năm 1969 đến 1975. Tên gọi "Đá Chông" xuất phát từ địa hình đặc trưng với nhiều khối đá nhọn, sắc như mũi chông mọc lên từ lòng đất. ',
                'address' => 'xã Minh Quang, Huyện Ba Vì',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_province' => 1,
                'name' => 'Chùa Hương',
                'description' => 'Chùa Hương nằm ở xã Hương Sơn, huyện Mỹ Đức, thành phố Hà Nội. Đây là một quần thể danh thắng và tâm linh nổi tiếng, cách trung tâm thủ đô Hà Nội khoảng 60-70km về phía Tây Nam.  ',
                'address' => 'xã Hương Sơn, Huyện Mỹ Đức',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_province' => 1,
                'name' => 'Làng gốm Bát Tràng',
                'description' => 'Làng gốm Bát Tràng là một làng nghề truyền thống nổi tiếng ở xã Bát Tràng, huyện Gia Lâm, Hà Nội, cách trung tâm thành phố khoảng 10km. Làng có lịch sử hơn 700 năm, nổi tiếng với các sản phẩm gốm sứ chất lượng cao, đa dạng mẫu mã như đồ gia dụng, bình hoa, tượng, và cả gạch mosaic. Du khách có thể trải nghiệm trực tiếp làm gốm, tham quan chợ gốm và tìm hiểu về nghề thủ công truyền thống tại đây. ',
                'address' => 'xã Bát Tràng, Huyện Gia Lâm',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_province' => 1,
                'name' => 'Văn Miếu - Quốc Tử Giám',
                'description' => 'Văn Miếu – Quốc Tử Giám là quần thể di tích đa dạng, phong phú hàng đầu của thành phố Hà Nội, nằm ở phía Nam kinh thành Thăng Long.',
                'address' => 'số 58 phố Quốc Tử Giám, phường Văn Miếu – Quốc Tử Giám',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}
