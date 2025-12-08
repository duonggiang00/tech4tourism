<?php

namespace App\Http\Controllers;

use App\Models\TripAssignment;
use App\Models\TripCheckIn;
use App\Models\TripNotes;
use App\Models\CheckInDetail;
use App\Models\Passenger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GuideController extends Controller
{
    /**
     * Hiển thị lịch trình của HDV
     */
    public function schedule(Request $request)
    {
        $user = $request->user();

        // Lấy cả assignments ở instance level VÀ template level
        // Ưu tiên instance level, nhưng nếu chưa có instance thì lấy template level
        $assignments = TripAssignment::with([
            'tourInstance.tourTemplate.images', // Load tourTemplate từ instance với images
            'tripCheckIns',
            'tripNotes'
        ])
            ->where('user_id', $user->id)
            // Lấy cả instance level và template level
            // Nếu có cả 2 (cùng tour_id), chỉ lấy instance level để tránh trùng lặp
            ->where(function ($query) use ($user) {
                $query->whereNotNull('tour_instance_id') // Instance level
                    ->orWhere(function ($q) use ($user) {
                        // Template level: chỉ lấy nếu chưa có instance level assignment cho cùng tour_id và user_id
                        $q->whereNull('tour_instance_id')
                            ->whereNotExists(function ($subQuery) use ($user) {
                            $subQuery->select(DB::raw(1))
                                ->from('trip_assignments as ta2')
                                ->whereColumn('ta2.tour_id', 'trip_assignments.tour_id')
                                ->where('ta2.user_id', $user->id)
                                ->whereNotNull('ta2.tour_instance_id');
                        });
                    });
            })
            ->when($request->status !== null && $request->status !== '', function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Đảm bảo mỗi assignment có tour data (từ tourInstance.tourTemplate hoặc load TourTemplate từ tour_id)
        $assignments->getCollection()->transform(function ($assignment) {
            // Ưu tiên: lấy từ tourInstance.tourTemplate
            if ($assignment->tourInstance && $assignment->tourInstance->tourTemplate) {
                $assignment->setRelation('tour', $assignment->tourInstance->tourTemplate);
            }
            // Nếu không có tourInstance, thử load TourTemplate từ tour_id
            elseif ($assignment->tour_id) {
                $tourTemplate = \App\Models\TourTemplate::with('images')->find($assignment->tour_id);
                if ($tourTemplate) {
                    $assignment->setRelation('tour', $tourTemplate);
                } else {
                    // Fallback: thử load Tour cũ
                    $tour = \App\Models\Tour::find($assignment->tour_id);
                    if ($tour) {
                        $assignment->setRelation('tour', $tour);
                    }
                }
            }
            return $assignment;
        });

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
            'tourInstance.tourTemplate.schedules.destination',
            'tourInstance.tourTemplate.images',
            'tour.schedules.destination', // Backward compatibility
            'tripCheckIns.checkInDetails.passenger',
            'tripNotes'
        ])->findOrFail($id);

        // Kiểm tra quyền truy cập
        if ($assignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền truy cập chuyến đi này');
        }

        // Đảm bảo assignment có tour data
        if (!$assignment->tour && $assignment->tourInstance && $assignment->tourInstance->tourTemplate) {
            $assignment->setRelation('tour', $assignment->tourInstance->tourTemplate);
        } elseif (!$assignment->tour && $assignment->tour_id) {
            $tourTemplate = \App\Models\TourTemplate::with('schedules.destination')->find($assignment->tour_id);
            if ($tourTemplate) {
                $assignment->setRelation('tour', $tourTemplate);
            }
        }

        // Lấy danh sách passengers từ các booking của tour instance này
        $passengers = Passenger::whereHas('booking', function ($query) use ($assignment) {
            if ($assignment->tour_instance_id) {
                $query->where('tour_instance_id', $assignment->tour_instance_id)
                    ->whereIn('status', [0, 1]); // Lấy cả chờ xác nhận và đã xác nhận
            } else {
                // Backward compatibility: nếu chưa có tour_instance_id
                $query->where('tour_id', $assignment->tour_id)
                    ->whereIn('status', [0, 1]);
            }
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
        $assignment = TripAssignment::with('tourInstance')->findOrFail($assignmentId);

        if ($assignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        if (!$assignment->tourInstance && !$assignment->tour_id) {
            return response()->json(['error' => 'Không tìm thấy thông tin tour'], 404);
        }

        $request->validate([
            'checkin_time' => 'required|date',
        ]);

        $checkInDate = \Carbon\Carbon::parse($request->checkin_time)->format('Y-m-d');

        // Lấy danh sách passengers
        $passengers = Passenger::whereHas('booking', function ($query) use ($assignment) {
            if ($assignment->tourInstance) {
                $query->where('tour_instance_id', $assignment->tourInstance->id)
                    ->whereIn('status', [0, 1]);
            } else {
                // Fallback: nếu chưa có tour_instance_id (assignment theo tour template)
                $query->where('tour_id', $assignment->tour_id)
                    ->whereIn('status', [0, 1]);
            }
        })->with([
                    'booking' => function ($q) {
                        $q->select('id', 'code', 'status', 'client_name', 'tour_instance_id');
                    }
                ])->get();

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
            'tripAssignment.tourInstance.tourTemplate', // Load thêm để fallback
            'checkInDetails.passenger'
        ])->findOrFail($checkInId);

        if ($checkIn->tripAssignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền truy cập');
        }

        // Lấy ngày check-in để lọc booking
        $checkInDate = \Carbon\Carbon::parse($checkIn->checkin_time)->format('Y-m-d');
        $assignment = $checkIn->tripAssignment;

        // FIX: Đảm bảo assignment có tour data (Fallback logic)
        if (!$assignment->tour && $assignment->tourInstance && $assignment->tourInstance->tourTemplate) {
            $assignment->setRelation('tour', $assignment->tourInstance->tourTemplate);
        } elseif (!$assignment->tour && $assignment->tour_id) {
            $tourTemplate = \App\Models\TourTemplate::find($assignment->tour_id);
            if ($tourTemplate) {
                $assignment->setRelation('tour', $tourTemplate);
            }
        }

        $tourInstance = $assignment->tourInstance;

        if (!$tourInstance) {
            // Backward compatibility: nếu chưa có tour_instance
            $passengers = Passenger::whereHas('booking', function ($query) use ($checkIn) {
                $query->where('tour_id', $checkIn->tripAssignment->tour_id)
                    ->whereIn('status', [0, 1]);
            })->with([
                        'booking' => function ($q) {
                            $q->select('id', 'code', 'status', 'client_name');
                        }
                    ])->get();
        } else {
            // Lấy danh sách passengers từ booking có:
            // - tour_instance_id = tour instance được phân công
            // - tour_instance.date_start = ngày check-in
            // - status = 0 (Chờ xác nhận) hoặc 1 (Đã xác nhận)
            $passengers = Passenger::whereHas('booking.tourInstance', function ($query) use ($tourInstance, $checkInDate) {
                $query->where('id', $tourInstance->id)
                    ->whereDate('date_start', $checkInDate);
            })->whereHas('booking', function ($query) {
                $query->whereIn('status', [0, 1]);
            })->with([
                        'booking' => function ($q) {
                            $q->select('id', 'code', 'status', 'client_name', 'tour_instance_id');
                        }
                    ])->get();
        }

        // Lấy trạng thái check-in hiện tại
        $checkedIn = $checkIn->checkInDetails->mapWithKeys(function ($detail) {
            return [
                $detail->passenger_id => [
                    'is_present' => (bool) $detail->is_present,
                    'notes' => $detail->notes,
                ]
            ];
        })->toArray();

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

        $notes = TripNotes::with([
            'tripAssignment.tourInstance.tourTemplate',
            'tripAssignment.tour'
        ])
            ->whereHas('tripAssignment', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Đảm bảo mỗi note có tour data
        $notes->getCollection()->transform(function ($note) {
            if ($note->tripAssignment) {
                if (!$note->tripAssignment->tour && $note->tripAssignment->tourInstance && $note->tripAssignment->tourInstance->tourTemplate) {
                    $note->tripAssignment->setRelation('tour', $note->tripAssignment->tourInstance->tourTemplate);
                } elseif (!$note->tripAssignment->tour && $note->tripAssignment->tour_id) {
                    $tourTemplate = \App\Models\TourTemplate::find($note->tripAssignment->tour_id);
                    if ($tourTemplate) {
                        $note->tripAssignment->setRelation('tour', $tourTemplate);
                    }
                }
            }
            return $note;
        });

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

    /**
     * Xác nhận đã kết thúc tour (chỉ khi hôm nay là ngày cuối cùng)
     */
    public function completeTour(Request $request, $assignmentId)
    {
        $assignment = TripAssignment::with('tourInstance')->findOrFail($assignmentId);

        if ($assignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        if (!$assignment->tourInstance) {
            return response()->json(['error' => 'Tour instance không tồn tại'], 404);
        }

        $today = \Carbon\Carbon::today();
        $dateEnd = \Carbon\Carbon::parse($assignment->tourInstance->date_end);

        // Kiểm tra xem hôm nay có phải là ngày cuối cùng (hoặc sau đó) không
        if ($today->lt($dateEnd)) {
            return response()->json([
                'error' => 'Chưa đến ngày kết thúc tour, bạn chưa thể xác nhận hoàn thành.'
            ], 400);
        }

        // Cập nhật status của assignment và tour instance
        $assignment->update(['status' => '2']); // Hoàn thành
        $assignment->tourInstance->update(['status' => 3]); // Đã hoàn thành

        return response()->json([
            'message' => 'Đã xác nhận kết thúc tour thành công',
            'assignment' => $assignment->fresh(['tourInstance.tourTemplate'])
        ]);
    }
    /**
     * Xuất danh sách hành khách ra file CSV
     */
    public function exportPassengers($assignmentId)
    {
        $assignment = TripAssignment::with('tourInstance.tourTemplate')->findOrFail($assignmentId);

        if ($assignment->user_id !== auth()->id()) {
            abort(403, 'Bạn không có quyền thực hiện');
        }

        $tourName = $assignment->tourInstance?->tourTemplate?->title ?? 'Tour';
        $fileName = 'danh-sach-khach-' . \Illuminate\Support\Str::slug($tourName) . '.csv';

        $passengers = Passenger::whereHas('booking', function ($query) use ($assignment) {
            if ($assignment->tour_instance_id) {
                $query->where('tour_instance_id', $assignment->tour_instance_id)
                    ->whereIn('status', [0, 1]);
            } else {
                $query->where('tour_id', $assignment->tour_id)
                    ->whereIn('status', [0, 1]);
            }
        })->with('booking')->get();

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($passengers) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 compatibility
            fputs($file, "\xEF\xBB\xBF");

            // Header Row
            fputcsv($file, ['Tên khách hàng', 'CCCD', 'Số điện thoại', 'Yêu cầu đặc biệt', 'Ngày giờ check-in', 'Điểm danh'], ';');

            foreach ($passengers as $pax) {
                fputcsv($file, [
                    $pax->fullname,
                    $pax->cccd ?? '',
                    $pax->phone ?? $pax->booking->phone,
                    $pax->request ?? '',
                    '',
                    ''
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

