<?php

namespace Database\Seeders;

use App\Models\Policy;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Style chuẩn văn bản Word
        $sContainer = "font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; color: #000; text-align: justify;";
        $sHeader = "font-weight: bold; text-transform: uppercase; margin-top: 12pt; margin-bottom: 6pt; font-size: 14pt;";
        $sPara = "margin-top: 0; margin-bottom: 6pt;";
        $sList = "margin-top: 0; margin-bottom: 6pt; padding-left: 25px; list-style-type: disc;";
        $sListItem = "margin-bottom: 3pt;";

        // 1. Chính sách Đặt Tour & Thanh Toán
        Policy::create([
            'title' => 'Chính Sách Đặt Tour & Thanh Toán',
            'content' => "
                <div style=\"$sContainer\">
                    <p style=\"$sPara\">Kính chào Quý khách hàng,</p>
                    <p style=\"$sPara\">Để đảm bảo quyền lợi và sự thuận tiện trong quá trình sử dụng dịch vụ, chúng tôi xin thông báo quy trình đặt tour và thanh toán như sau:</p>
                    <h3 style=\"$sHeader\">1. QUY TRÌNH ĐẶT CỌC</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Quý khách vui lòng đặt cọc <strong>50%</strong> tổng giá trị tour ngay sau khi chốt lịch trình và ký hợp đồng xác nhận dịch vụ.</li>
                        <li style=\"$sListItem\">Đối với các tour vào dịp Lễ, Tết hoặc mùa cao điểm, số tiền đặt cọc có thể lên đến <strong>70% - 100%</strong> tùy theo yêu cầu giữ chỗ của các đối tác cung ứng.</li>
                    </ul>
                    <h3 style=\"$sHeader\">2. THANH TOÁN PHẦN CÒN LẠI</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Số tiền còn lại cần được thanh toán hoàn tất trước ngày khởi hành ít nhất <strong>07 ngày làm việc</strong> (đối với tour ngày thường).</li>
                        <li style=\"$sListItem\">Đối với các đoàn lớn hoặc tour thiết kế riêng, thời hạn thanh toán có thể thay đổi tùy theo thỏa thuận trong hợp đồng.</li>
                    </ul>
                    <h3 style=\"$sHeader\">3. HÌNH THỨC THANH TOÁN</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\"><strong>Tiền mặt:</strong> Trực tiếp tại văn phòng công ty hoặc nhân viên thu tiền tận nơi (có phiếu thu).</li>
                        <li style=\"$sListItem\"><strong>Chuyển khoản ngân hàng:</strong> Theo thông tin tài khoản được cung cấp trong email xác nhận booking.</li>
                        <li style=\"$sListItem\"><strong>Thẻ tín dụng/Thẻ ghi nợ:</strong> Chấp nhận các loại thẻ Visa, Master, JCB (có thể áp dụng phí giao dịch).</li>
                    </ul>
                    <p style=\"$sPara\"><em>Lưu ý: Booking chỉ được xem là thành công khi Quý khách nhận được xác nhận từ công ty.</em></p>
                </div>
            ",
        ]);

        // 2. Chính sách Hủy Tour
        Policy::create([
            'title' => 'Chính Sách Hủy Tour & Phạt Hủy',
            'content' => "
                <div style=\"$sContainer\">
                    <p style=\"$sPara\">Trong trường hợp Quý khách muốn hủy chuyến đi vì lý do cá nhân, vui lòng tham khảo các mức phí phạt hủy dưới đây:</p>
                    <h3 style=\"$sHeader\">1. ĐỐI VỚI TOUR NGÀY THƯỜNG</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Hủy trước ngày khởi hành <strong>30 ngày</strong>: Miễn phí (hoàn trả 100% tiền cọc).</li>
                        <li style=\"$sListItem\">Hủy từ <strong>15 - 29 ngày</strong> trước ngày khởi hành: Phạt <strong>30%</strong> tổng giá trị tour.</li>
                        <li style=\"$sListItem\">Hủy từ <strong>07 - 14 ngày</strong> trước ngày khởi hành: Phạt <strong>70%</strong> tổng giá trị tour.</li>
                        <li style=\"$sListItem\">Hủy trong vòng <strong>07 ngày</strong> trước ngày khởi hành hoặc không đến: Phạt <strong>100%</strong> tổng giá trị tour.</li>
                    </ul>
                    <h3 style=\"$sHeader\">2. ĐỐI VỚI TOUR LỄ, TẾT</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Hủy trước 45 ngày: Phạt 30% tổng giá trị tour.</li>
                        <li style=\"$sListItem\">Hủy từ 30 - 44 ngày: Phạt 70% tổng giá trị tour.</li>
                        <li style=\"$sListItem\">Hủy trong vòng 30 ngày: Phạt 100% tổng giá trị tour.</li>
                    </ul>
                    <h3 style=\"$sHeader\">3. TRƯỜNG HỢP BẤT KHẢ KHÁNG</h3>
                    <p style=\"$sPara\">Nếu tour bị hủy do thiên tai, dịch bệnh, chiến tranh, hoặc lệnh cấm của cơ quan nhà nước:</p>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Hai bên sẽ cùng nhau thỏa thuận dời ngày khởi hành sang thời điểm thích hợp.</li>
                        <li style=\"$sListItem\">Nếu không thể dời ngày, công ty sẽ hoàn trả lại chi phí sau khi đã trừ đi các khoản phí thực tế đã chi trả cho nhà cung cấp (nếu có).</li>
                    </ul>
                </div>
            ",
        ]);

        // 3. Chính sách Đổi Lịch
        Policy::create([
            'title' => 'Chính Sách Đổi Lịch Trình',
            'content' => "
                <div style=\"$sContainer\">
                    <p style=\"$sPara\">Chúng tôi hỗ trợ Quý khách đổi ngày khởi hành hoặc thay đổi hành trình với các điều kiện sau:</p>
                    <h3 style=\"$sHeader\">1. THỜI GIAN THÔNG BÁO</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Quý khách cần thông báo yêu cầu đổi lịch trước ngày khởi hành ít nhất <strong>20 ngày</strong>.</li>
                        <li style=\"$sListItem\">Mỗi booking chỉ được hỗ trợ dời lịch <strong>01 lần duy nhất</strong>.</li>
                    </ul>
                    <h3 style=\"$sHeader\">2. PHÍ CHÊNH LỆCH & PHÍ DỊCH VỤ</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Nếu giá tour tại thời điểm mới cao hơn giá cũ, Quý khách vui lòng thanh toán thêm phần chênh lệch.</li>
                        <li style=\"$sListItem\">Nếu có phát sinh phí đổi vé máy bay, phí phạt từ khách sạn do thay đổi ngày, Quý khách sẽ chịu trách nhiệm thanh toán các khoản phí thực tế này.</li>
                    </ul>
                    <h3 style=\"$sHeader\">3. QUYỀN TỪ CHỐI</h3>
                    <p style=\"$sPara\">Công ty có quyền từ chối yêu cầu đổi lịch nếu:</p>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Đã quá thời hạn thông báo quy định.</li>
                        <li style=\"$sListItem\">Không còn chỗ trống vào ngày khởi hành mới mà Quý khách mong muốn.</li>
                    </ul>
                </div>
            ",
        ]);

        // 4. Chính sách Hoàn Tiền
        Policy::create([
            'title' => 'Chính Sách Hoàn Tiền',
            'content' => "
                <div style=\"$sContainer\">
                    <p style=\"$sPara\">Quy trình hoàn tiền cho Quý khách hàng trong các trường hợp hủy tour hợp lệ hoặc do sự cố khách quan:</p>
                    <h3 style=\"$sHeader\">1. THỜI GIAN XỬ LÝ</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Thời gian xử lý hoàn tiền là từ <strong>07 đến 15 ngày làm việc</strong> (không tính Thứ 7, Chủ nhật và các ngày Lễ Tết) kể từ ngày hai bên thống nhất việc hoàn tiền.</li>
                    </ul>
                    <h3 style=\"$sHeader\">2. PHƯƠNG THỨC HOÀN TIỀN</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Việc hoàn tiền sẽ được thực hiện thông qua <strong>Chuyển khoản ngân hàng</strong> vào tài khoản do Quý khách cung cấp.</li>
                        <li style=\"$sListItem\">Chúng tôi hạn chế hoàn tiền mặt để đảm bảo tính minh bạch và an toàn.</li>
                    </ul>
                    <h3 style=\"$sHeader\">3. PHÍ GIAO DỊCH</h3>
                    <ul style=\"$sList\">
                        <li style=\"$sListItem\">Nếu lỗi thuộc về phía Công ty, chúng tôi sẽ chịu 100% phí chuyển khoản.</li>
                        <li style=\"$sListItem\">Nếu việc hủy/hoàn tiền xuất phát từ yêu cầu của Quý khách, phí chuyển khoản ngân hàng (nếu có) sẽ được trừ vào số tiền hoàn lại.</li>
                    </ul>
                </div>
            ",
        ]);
    }
}