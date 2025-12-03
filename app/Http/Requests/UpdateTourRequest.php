<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTourRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        // Lấy ID của tour đang sửa từ route
        // Ví dụ route: tours/{tour}, thì tham số là 'tour'
        $tour = $this->route('tour');
        $tourId = $tour instanceof \App\Models\Tour ? $tour->id : $tour;

        return [
            // --- 1. Tour Basic ---
            'category_id' => 'required|exists:categories,id',
            'province_id' => 'required|exists:provinces,id',

            // QUAN TRỌNG: Bỏ qua check unique nếu là chính tour này
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tours', 'title')->ignore($tourId),
            ],

            'status' => 'required|in:0,1,2,3',
            'day' => 'required|integer|min:1',
            'night' => 'required|integer|min:0',

            // Khi update, không bắt buộc ngày phải từ hôm nay trở đi (để sửa tour cũ)
            'date_start' => 'required|date',

            'limit' => 'nullable|integer|min:1',
            'price_adult' => 'required|numeric|min:0',
            'price_children' => 'nullable|numeric|min:0',

            // QUAN TRỌNG: Ảnh đại diện không bắt buộc khi update
            'thumbnail' => 'nullable|image|max:2048',

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
            'schedules.*.destination_id' => 'nullable|exists:destinations,id',

            // --- 4. Tour Services ---
            'tour_services' => 'nullable|array',
            'tour_services.*.service_id' => 'required|exists:services,id',
            'tour_services.*.quantity' => 'required|integer|min:1',
            'tour_services.*.unit' => 'required|string|max:50',
            'tour_services.*.price_unit' => 'required|numeric|min:0',
            'tour_services.*.price_total' => 'required|numeric|min:0',
            'tour_services.*.description' => 'nullable|string',

            // --- 5. Relations ---
            'policy_ids' => 'nullable|array',
            'policy_ids.*' => 'exists:policies,id',

            'guide_ids' => 'nullable|array',
            'guide_ids.*' => 'exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
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

            'limit.min' => 'Giới hạn số khách phải ít nhất là 1.',

            'price_adult.required' => 'Vui lòng nhập giá người lớn.',
            'price_adult.numeric' => 'Giá người lớn phải là dạng số.',
            'price_adult.min' => 'Giá người lớn không được âm.',

            'price_children.numeric' => 'Giá trẻ em phải là dạng số.',
            'price_children.min' => 'Giá trẻ em không được âm.',

            'thumbnail.image' => 'File tải lên phải là hình ảnh.',
            'thumbnail.max' => 'Dung lượng ảnh đại diện không được vượt quá 2MB.',

            'gallery_images.array' => 'Dữ liệu thư viện ảnh không hợp lệ.',
            'gallery_images.*.image' => 'Một trong các file trong thư viện ảnh không phải là hình ảnh.',
            'gallery_images.*.max' => 'Một trong các ảnh trong thư viện vượt quá dung lượng 2MB.',

            'schedules.array' => 'Dữ liệu lịch trình không hợp lệ.',
            'schedules.*.name.required' => 'Tên hoạt động trong lịch trình không được để trống.',
            'schedules.*.date.required' => 'Ngày thứ trong lịch trình không được để trống.',
            'schedules.*.destination_id.exists' => 'Địa điểm trong lịch trình không tồn tại.',

            'tour_services.array' => 'Dữ liệu dịch vụ đi kèm không hợp lệ.',
            'tour_services.*.service_id.required' => 'Vui lòng chọn tên dịch vụ.',
            'tour_services.*.quantity.required' => 'Vui lòng nhập số lượng dịch vụ.',
            'tour_services.*.price_unit.required' => 'Đơn giá dịch vụ bị thiếu.',
            'tour_services.*.price_total.required' => 'Thành tiền dịch vụ bị thiếu.',

            'policy_ids.array' => 'Dữ liệu chính sách không hợp lệ.',
            'policy_ids.*.exists' => 'Chính sách đã chọn không tồn tại.',

            'guide_ids.array' => 'Dữ liệu hướng dẫn viên không hợp lệ.',
            'guide_ids.*.exists' => 'Hướng dẫn viên đã chọn không tồn tại.',
        ];
    }
}