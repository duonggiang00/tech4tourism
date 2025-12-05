<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    /**
     * Tạo thanh toán mới cho booking
     */
    public function store(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|integer|in:0,1,2,3', // 0: Tiền mặt, 1: Chuyển khoản, 2: Thẻ, 3: Gateway
            'date' => 'required|date',
            'thumbnail' => 'nullable|image|max:2048', // Ảnh biên lai
            'status' => 'nullable|integer|in:0,1,2', // 0: Failed, 1: Success, 2: Pending
        ], [
            'amount.required' => 'Vui lòng nhập số tiền.',
            'amount.min' => 'Số tiền phải lớn hơn 0.',
            'method.required' => 'Vui lòng chọn phương thức thanh toán.',
            'date.required' => 'Vui lòng chọn ngày thanh toán.',
        ]);

        try {
            DB::beginTransaction();

            // Upload ảnh nếu có
            $thumbnailPath = null;
            if ($request->hasFile('thumbnail')) {
                $thumbnailPath = $request->file('thumbnail')->store('payments', 'public');
            }

            // Tạo payment
            $payment = Payment::create([
                'booking_id' => $booking->id,
                'amount' => $validated['amount'],
                'method' => $validated['method'],
                'status' => $validated['status'] ?? 1, // Mặc định là thành công
                'date' => $validated['date'],
                'thumbnail' => $thumbnailPath,
            ]);

            // Kiểm tra nếu đã thanh toán đủ, tự động cập nhật status booking
            $totalPaid = $booking->payments()
                ->where('status', 1) // Chỉ tính thanh toán thành công
                ->sum('amount');

            if ($totalPaid >= $booking->final_price) {
                // Nếu chưa hoàn thành, cập nhật status
                if ($booking->status != 3) {
                    $booking->update(['status' => 3]); // Hoàn thành
                }
            } elseif ($totalPaid > 0 && $booking->status == 0) {
                // Nếu đã có thanh toán và đang chờ, chuyển sang đã xác nhận
                $booking->update(['status' => 1]); // Đã xác nhận
            }

            DB::commit();

            return back()->with('success', 'Thêm thanh toán thành công!');
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Xóa ảnh nếu đã upload nhưng có lỗi
            if (isset($thumbnailPath) && Storage::disk('public')->exists($thumbnailPath)) {
                Storage::disk('public')->delete($thumbnailPath);
            }

            return back()->with('error', 'Có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    /**
     * Cập nhật thanh toán
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|integer|in:0,1,2,3',
            'date' => 'required|date',
            'status' => 'required|integer|in:0,1,2',
            'thumbnail' => 'nullable|image|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $oldThumbnail = $payment->thumbnail;

            // Upload ảnh mới nếu có
            if ($request->hasFile('thumbnail')) {
                $thumbnailPath = $request->file('thumbnail')->store('payments', 'public');
                $validated['thumbnail'] = $thumbnailPath;
                
                // Xóa ảnh cũ
                if ($oldThumbnail && Storage::disk('public')->exists($oldThumbnail)) {
                    Storage::disk('public')->delete($oldThumbnail);
                }
            } else {
                unset($validated['thumbnail']);
            }

            $payment->update($validated);

            // Cập nhật lại status booking nếu cần
            $booking = $payment->booking;
            $totalPaid = $booking->payments()
                ->where('status', 1)
                ->sum('amount');

            if ($totalPaid >= $booking->final_price) {
                if ($booking->status != 3) {
                    $booking->update(['status' => 3]);
                }
            } elseif ($totalPaid > 0 && $booking->status == 0) {
                $booking->update(['status' => 1]);
            }

            DB::commit();

            return back()->with('success', 'Cập nhật thanh toán thành công!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    /**
     * Xóa thanh toán
     */
    public function destroy(Payment $payment)
    {
        try {
            DB::beginTransaction();

            $booking = $payment->booking;
            $thumbnailPath = $payment->thumbnail;

            $payment->delete();

            // Xóa ảnh
            if ($thumbnailPath && Storage::disk('public')->exists($thumbnailPath)) {
                Storage::disk('public')->delete($thumbnailPath);
            }

            // Cập nhật lại status booking
            $totalPaid = $booking->payments()
                ->where('status', 1)
                ->sum('amount');

            if ($totalPaid < $booking->final_price && $booking->status == 3) {
                $booking->update(['status' => 1]); // Chuyển về đã xác nhận
            }

            DB::commit();

            return back()->with('success', 'Xóa thanh toán thành công!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Có lỗi xảy ra: ' . $e->getMessage());
        }
    }
}

