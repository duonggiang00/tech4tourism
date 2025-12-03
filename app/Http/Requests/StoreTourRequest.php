<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreTourRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // --- 1. Tour Basic ---
            'category_id' => 'required|exists:categories,id',

            // SỬA: Kiểm tra trong bảng 'provinces' thay vì 'destinations'
            'province_id' => 'required|exists:provinces,id',

            'title' => 'required|string|max:255|unique:tours,title',
            'status' => 'required|in:0,1,2,3', // Thêm status 3 nếu có (Sắp ra mắt)
            'day' => 'required|integer|min:1',
            'night' => 'required|integer|min:0',
            'date_start' => 'required|date|after_or_equal:today',
            'limit' => 'nullable|integer|min:1',
            'price_adult' => 'required|numeric|min:0',
            'price_children' => 'nullable|numeric|min:0',
            'thumbnail' => 'required|image|max:2048',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',

            // --- 2. Images Array ---
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|max:2048',

            // --- 3. Schedules Array ---
            'schedules' => 'nullable|array',
            'schedules.*.name' => 'required|string',
            'schedules.*.description' => 'nullable|string',
            'schedules.*.date' => 'required|integer',
            // destination_id trong schedules vẫn trỏ về bảng destinations
            'schedules.*.destination_id' => 'nullable|exists:destinations,id',


            // --- 4. Tour Services (CẬP NHẬT MỚI) ---
            // Thay thế service_ids cũ bằng mảng object chi tiết
            'tour_services' => 'nullable|array',
            'tour_services.*.service_id' => 'required|exists:services,id',
            'tour_services.*.quantity' => 'required|integer|min:1',
            'tour_services.*.unit' => 'required|string|max:50',
            'tour_services.*.price_unit' => 'required|numeric|min:0',
            'tour_services.*.price_total' => 'required|numeric|min:0',
            'tour_services.*.description' => 'nullable|string',

            // --- 5. Other Relations ---
            'policy_ids' => 'nullable|array',
            'policy_ids.*' => 'exists:policies,id',

            'guide_ids' => 'nullable|array',
            'guide_ids.*' => 'exists:users,id',
        ];
    }

    // (Chỉ bật khi cần debug, tắt khi chạy thật)
    // protected function failedValidation(Validator $validator)
    // {
    //    dd($validator->errors());
    // }

    public function messages(): array
    {
        return [
            // --- 1. Basic Info ---
            'category_id.required' => 'Vui lòng chọn danh mục tour.',
            'category_id.exists' => 'Danh mục đã chọn không tồn tại.',

            'province_id.required' => 'Vui lòng chọn Tỉnh/Thành phố.',
            'province_id.exists' => 'Tỉnh/Thành phố đã chọn không tồn tại.',

            'title.required' => 'Tên tour không được để trống.',
            'title.max' => 'Tên tour không được vượt quá 255 ký tự.',
            'title.unique' => 'Tên tour này đã tồn tại, vui lòng chọn tên khác.',

            'status.required' => 'Vui lòng chọn trạng thái.',
            'status.in' => 'Trạng thái không hợp lệ.',

            'day.required' => 'Số ngày không được để trống.',
            'day.min' => 'Số ngày tối thiểu là 1.',

            'night.required' => 'Số đêm không được để trống.',
            'night.min' => 'Số đêm không được nhỏ hơn 0.',

            'date_start.required' => 'Vui lòng chọn ngày khởi hành.',
            'date_start.date' => 'Định dạng ngày không hợp lệ.',
            'date_start.after_or_equal' => 'Ngày khởi hành phải từ hôm nay trở đi.',

            'limit.min' => 'Giới hạn số khách phải ít nhất là 1.',

            'price_adult.required' => 'Vui lòng nhập giá người lớn.',
            'price_adult.numeric' => 'Giá người lớn phải là dạng số.',
            'price_adult.min' => 'Giá người lớn không được âm.',

            'price_children.numeric' => 'Giá trẻ em phải là dạng số.',
            'price_children.min' => 'Giá trẻ em không được âm.',

            'thumbnail.required' => 'Vui lòng tải lên ảnh đại diện (Thumbnail).',
            'thumbnail.image' => 'File tải lên phải là hình ảnh.',
            'thumbnail.max' => 'Dung lượng ảnh đại diện không được vượt quá 2MB.',

            // --- 2. Gallery Images ---
            'gallery_images.array' => 'Dữ liệu thư viện ảnh không hợp lệ.',
            'gallery_images.*.image' => 'Một trong các file trong thư viện ảnh không phải là hình ảnh.',
            'gallery_images.*.max' => 'Một trong các ảnh trong thư viện vượt quá dung lượng 2MB.',

            // --- 3. Schedules ---
            'schedules.array' => 'Dữ liệu lịch trình không hợp lệ.',
            'schedules.*.name.required' => 'Tên hoạt động trong lịch trình không được để trống.',
            'schedules.*.date.required' => 'Ngày thứ trong lịch trình không được để trống.',
            'schedules.*.date.integer' => 'Ngày thứ phải là số nguyên.',
            'schedules.*.destination_id.exists' => 'Địa điểm trong lịch trình không tồn tại.',

            // --- 4. Tour Services ---
            'tour_services.array' => 'Dữ liệu dịch vụ đi kèm không hợp lệ.',
            'tour_services.*.service_id.required' => 'Vui lòng chọn tên dịch vụ.',
            'tour_services.*.service_id.exists' => 'Dịch vụ đã chọn không tồn tại trong hệ thống.',
            'tour_services.*.quantity.required' => 'Vui lòng nhập số lượng dịch vụ.',
            'tour_services.*.quantity.min' => 'Số lượng dịch vụ tối thiểu là 1.',
            'tour_services.*.unit.required' => 'Vui lòng nhập đơn vị tính.',
            'tour_services.*.price_unit.required' => 'Đơn giá dịch vụ bị thiếu.',
            'tour_services.*.price_total.required' => 'Thành tiền dịch vụ bị thiếu.',

            // --- 5. Relations ---
            'policy_ids.array' => 'Dữ liệu chính sách không hợp lệ.',
            'policy_ids.*.exists' => 'Chính sách đã chọn không tồn tại.',

            'guide_ids.array' => 'Dữ liệu hướng dẫn viên không hợp lệ.',
            'guide_ids.*.exists' => 'Hướng dẫn viên đã chọn không tồn tại.',
        ];
    }
}