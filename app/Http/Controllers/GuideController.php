<?php

namespace App\Http\Controllers;

use App\Models\TripAssignment;
use App\Models\TripCheckIn;
use App\Models\TripNotes;
use App\Models\CheckInDetail;
use App\Models\Passenger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuideController extends Controller
{
    /**
     * Hiển thị lịch trình của HDV
     */
    public function schedule(Request $request)
    {
        $user = $request->user();
        
        $assignments = TripAssignment::with(['tour', 'tripCheckIns', 'tripNotes'])
            ->where('user_id', $user->id)
            ->when($request->status !== null && $request->status !== '', function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Guide/Schedule', [
            'assignments' => $assignments,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Chi tiết chuyến đi
     */
    public function tripDetail($id)
    {
        $assignment = TripAssignment::with([
            'tour.schedules.destination',
            'tripCheckIns.checkInDetails.passenger',
            'tripNotes'
        ])->findOrFail($id);

        // Kiểm tra quyền truy cập
        if ($assignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền truy cập chuyến đi này');
        }

        // Lấy danh sách passengers từ các booking của tour này
        $passengers = Passenger::whereHas('booking', function ($query) use ($assignment) {
            $query->where('tour_id', $assignment->tour_id)
                  ->where('status', 1); // Chỉ lấy booking đã xác nhận
        })->with('booking')->get();

        return Inertia::render('Guide/TripDetail', [
            'assignment' => $assignment,
            'passengers' => $passengers,
        ]);
    }

    /**
     * Lấy danh sách passengers theo assignment và checkin_time (cho modal)
     */
    public function getPassengersForCheckIn(Request $request, $assignmentId)
    {
        $assignment = TripAssignment::findOrFail($assignmentId);

        if ($assignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        $request->validate([
            'checkin_time' => 'required|date',
        ]);

        $checkInDate = \Carbon\Carbon::parse($request->checkin_time)->format('Y-m-d');

        // Lấy danh sách passengers từ booking có:
        // - tour_id = tour được phân công
        // - date_start = ngày check-in
        // - status = 0 (Chờ xác nhận) hoặc 1 (Đã xác nhận)
        $passengers = Passenger::whereHas('booking', function ($query) use ($assignment, $checkInDate) {
            $query->where('tour_id', $assignment->tour_id)
                  ->where('date_start', $checkInDate)
                  ->whereIn('status', [0, 1]);
        })->with(['booking' => function($q) {
            $q->select('id', 'code', 'status', 'client_name');
        }])->get();

        return response()->json($passengers);
    }

    /**
     * Tạo đợt check-in mới (theo điểm đến) kèm điểm danh
     */
    public function createCheckIn(Request $request, $assignmentId)
    {
        $assignment = TripAssignment::findOrFail($assignmentId);

        if ($assignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'checkin_time' => 'required|date',
            'passengers' => 'nullable|array',
            'passengers.*.passenger_id' => 'required|exists:passengers,id',
            'passengers.*.is_present' => 'required|boolean',
            'passengers.*.notes' => 'nullable|string|max:500',
        ], [
            'title.required' => 'Vui lòng nhập tên điểm đến',
            'checkin_time.required' => 'Vui lòng chọn thời gian check-in',
        ]);

        // Tạo check-in trong transaction
        \DB::beginTransaction();
        try {
            $checkIn = TripCheckIn::create([
                'trip_assignment_id' => $assignmentId,
                'title' => $validated['title'],
                'checkin_time' => $validated['checkin_time'],
            ]);

            // Tạo check-in details nếu có passengers data
            if (isset($validated['passengers']) && is_array($validated['passengers'])) {
                foreach ($validated['passengers'] as $passengerData) {
                    CheckInDetail::create([
                        'trip_check_in_id' => $checkIn->id,
                        'passenger_id' => $passengerData['passenger_id'],
                        'is_present' => $passengerData['is_present'],
                        'notes' => $passengerData['notes'] ?? null,
                    ]);
                }
            }

            \DB::commit();
            return redirect()->back()->with('success', 'Tạo đợt check-in và lưu điểm danh thành công');
        } catch (\Exception $e) {
            \DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()]);
        }
    }

    /**
     * Hiển thị form check-in
     */
    public function showCheckIn($checkInId)
    {
        $checkIn = TripCheckIn::with([
            'tripAssignment.tour',
            'checkInDetails.passenger'
        ])->findOrFail($checkInId);

        if ($checkIn->tripAssignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền truy cập');
        }

        // Lấy ngày check-in để lọc booking
        $checkInDate = \Carbon\Carbon::parse($checkIn->checkin_time)->format('Y-m-d');
        
        // Lấy danh sách passengers từ booking có:
        // - tour_id = tour được phân công
        // - date_start = ngày check-in
        // - status = 0 (Chờ xác nhận) hoặc 1 (Đã xác nhận)
        $passengers = Passenger::whereHas('booking', function ($query) use ($checkIn, $checkInDate) {
            $query->where('tour_id', $checkIn->tripAssignment->tour_id)
                  ->where('date_start', $checkInDate)
                  ->whereIn('status', [0, 1]); // Hiển thị cả booking chờ xác nhận và đã xác nhận
        })->with(['booking' => function($q) {
            $q->select('id', 'code', 'status', 'client_name');
        }])->get();

        // Lấy trạng thái check-in hiện tại
        $checkedIn = $checkIn->checkInDetails->pluck('is_present', 'passenger_id')->toArray();

        return Inertia::render('Guide/CheckIn', [
            'checkIn' => $checkIn,
            'passengers' => $passengers,
            'checkedIn' => $checkedIn,
        ]);
    }

    /**
     * Lưu check-in passengers
     */
    public function saveCheckIn(Request $request, $checkInId)
    {
        $checkIn = TripCheckIn::findOrFail($checkInId);

        if ($checkIn->tripAssignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        $validated = $request->validate([
            'passengers' => 'required|array',
            'passengers.*.passenger_id' => 'required|exists:passengers,id',
            'passengers.*.is_present' => 'required|boolean',
            'passengers.*.notes' => 'nullable|string|max:500',
        ]);

        foreach ($validated['passengers'] as $passengerData) {
            CheckInDetail::updateOrCreate(
                [
                    'trip_check_in_id' => $checkInId,
                    'passenger_id' => $passengerData['passenger_id'],
                ],
                [
                    'is_present' => $passengerData['is_present'],
                    'notes' => $passengerData['notes'] ?? null,
                ]
            );
        }

        return redirect()->back()->with('success', 'Lưu check-in thành công');
    }

    /**
     * Danh sách nhật ký
     */
    public function notes(Request $request)
    {
        $user = $request->user();

        $notes = TripNotes::with('tripAssignment.tour')
            ->whereHas('tripAssignment', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Guide/Notes', [
            'notes' => $notes,
        ]);
    }

    /**
     * Tạo nhật ký mới
     */
    public function createNote(Request $request, $assignmentId)
    {
        $assignment = TripAssignment::findOrFail($assignmentId);

        if ($assignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ], [
            'title.required' => 'Vui lòng nhập tiêu đề',
            'content.required' => 'Vui lòng nhập nội dung',
        ]);

        TripNotes::create([
            'trip_assignment_id' => $assignmentId,
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        return redirect()->back()->with('success', 'Tạo nhật ký thành công');
    }

    /**
     * Cập nhật nhật ký
     */
    public function updateNote(Request $request, $noteId)
    {
        $note = TripNotes::findOrFail($noteId);

        if ($note->tripAssignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $note->update($validated);

        return redirect()->back()->with('success', 'Cập nhật nhật ký thành công');
    }

    /**
     * Xóa nhật ký
     */
    public function deleteNote($noteId)
    {
        $note = TripNotes::findOrFail($noteId);

        if ($note->tripAssignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        $note->delete();

        return redirect()->back()->with('success', 'Xóa nhật ký thành công');
    }

    /**
     * Xóa đợt check-in
     */
    public function deleteCheckIn($checkInId)
    {
        $checkIn = TripCheckIn::findOrFail($checkInId);

        if ($checkIn->tripAssignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        $checkIn->checkInDetails()->delete();
        $checkIn->delete();

        return redirect()->back()->with('success', 'Xóa đợt check-in thành công');
    }
}

