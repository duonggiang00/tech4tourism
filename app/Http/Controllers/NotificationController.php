<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\TripAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Lấy danh sách thông báo của user hiện tại
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Đánh dấu thông báo đã đọc
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'message' => 'Đã đánh dấu đã đọc',
        ]);
    }

    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'Đã đánh dấu tất cả đã đọc',
        ]);
    }

    /**
     * Xác nhận đã nhận tour (cập nhật status TripAssignment)
     */
    public function confirmAssignment(Request $request, $assignmentId)
    {
        $user = $request->user();
        
        $assignment = TripAssignment::where('id', $assignmentId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Cập nhật status: 0 (Chờ) → 1 (Đang thực hiện)
        $assignment->update(['status' => '1']);

        // Đánh dấu notification liên quan đã đọc
        Notification::where('user_id', $user->id)
            ->where('type', 'tour_assigned')
            ->where('data->assignment_id', $assignmentId)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'Đã xác nhận nhận tour thành công!',
            'assignment' => $assignment->load('tour'),
        ]);
    }
}
