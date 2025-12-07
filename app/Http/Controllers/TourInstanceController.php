<?php

namespace App\Http\Controllers;

use App\Models\TourTemplate;
use App\Models\TourInstance;
use App\Models\TripAssignment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TourInstanceController extends Controller
{
    /**
     * Hiển thị form tạo instance từ template
     */
    public function create($tour)
    {
        // Route binding có thể trả về TourTemplate hoặc Tour (backward compatibility)
        $template = $tour instanceof TourTemplate
            ? $tour
            : TourTemplate::with(['schedules', 'tourServices', 'tourPolicies'])->findOrFail(
                is_object($tour) && isset($tour->id) ? $tour->id : $tour
            );

        // Lấy danh sách HDV (role=2) kèm thông tin đã có tour hay chưa
        // Chỉ lấy assignment của tour/instance còn tồn tại (chưa bị xóa)
        $busyGuideIds = TripAssignment::whereIn('status', ['0', '1']) // Chờ hoặc Đang thực hiện
            ->where(function ($query) {
                // Template-level: kiểm tra TourTemplate còn tồn tại (chưa bị soft delete)
                $query->where(function ($q) {
                    $q->whereNotNull('tour_id')
                        ->whereNull('tour_instance_id')
                        ->whereExists(function ($subQuery) {
                            $subQuery->select(DB::raw(1))
                                ->from('tour_templates')
                                ->whereColumn('tour_templates.id', 'trip_assignments.tour_id')
                                ->whereNull('tour_templates.deleted_at');
                        });
                })
                    // Instance-level: kiểm tra TourInstance và TourTemplate còn tồn tại
                    ->orWhere(function ($q) {
                    $q->whereNotNull('tour_instance_id')
                        ->whereExists(function ($subQuery) {
                            $subQuery->select(DB::raw(1))
                                ->from('tour_instances')
                                ->join('tour_templates', 'tour_instances.tour_template_id', '=', 'tour_templates.id')
                                ->whereColumn('tour_instances.id', 'trip_assignments.tour_instance_id')
                                ->whereNull('tour_instances.deleted_at')
                                ->whereNull('tour_templates.deleted_at');
                        });
                });
            })
            ->pluck('user_id')
            ->toArray();

        $guides = User::where('role', 2)->get()->map(function ($user) use ($busyGuideIds) {
            $user->has_active_tour = in_array($user->id, $busyGuideIds);
            return $user;
        });

        return Inertia::render('TourInstances/Create', [
            'template' => $template,
            'guides' => $guides,
        ]);
    }

    /**
     * Tạo instance mới từ template
     */
    public function store(Request $request, $tour)
    {
        $validated = $request->validate([
            'date_start' => 'required|date|after_or_equal:today',
            'limit' => 'nullable|integer|min:1',
            'price_adult' => 'nullable|numeric|min:0',
            'price_children' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:0,1,2,3',
            'guide_ids' => 'nullable|array',
            'guide_ids.*' => 'exists:users,id',
        ], [
            'date_start.required' => 'Vui lòng chọn ngày khởi hành.',
            'date_start.date' => 'Định dạng ngày không hợp lệ.',
            'date_start.after_or_equal' => 'Ngày khởi hành phải từ hôm nay trở đi.',
            'limit.min' => 'Giới hạn số khách phải ít nhất là 1.',
            'price_adult.numeric' => 'Giá người lớn phải là dạng số.',
            'price_adult.min' => 'Giá người lớn không được âm.',
            'price_children.numeric' => 'Giá trẻ em phải là dạng số.',
            'price_children.min' => 'Giá trẻ em không được âm.',
        ]);

        // Route binding có thể trả về TourTemplate hoặc Tour (backward compatibility)
        $template = $tour instanceof TourTemplate
            ? $tour
            : TourTemplate::findOrFail(
                is_object($tour) && isset($tour->id) ? $tour->id : $tour
            );

        DB::beginTransaction();
        try {
            // Tính date_end
            $dateEnd = Carbon::parse($validated['date_start'])->addDays($template->day - 1);

            // Nếu instance không có giá, dùng giá từ template (giá mặc định)
            $instance = TourInstance::create([
                'tour_template_id' => $template->id,
                'date_start' => $validated['date_start'],
                'date_end' => $dateEnd,
                'limit' => $validated['limit'] ?? null,
                'booked_count' => 0,
                'price_adult' => $validated['price_adult'] ?? $template->price_adult,
                'price_children' => $validated['price_children'] ?? $template->price_children,
                'status' => $validated['status'] ?? 1,
            ]);

            // Tạo trip assignments nếu có guides
            // Nếu không có guide_ids trong request, tự động copy từ template
            $guideIds = !empty($validated['guide_ids'])
                ? $validated['guide_ids']
                : TripAssignment::where('tour_id', $template->id)
                    ->whereNull('tour_instance_id')
                    ->pluck('user_id')
                    ->toArray();

            if (!empty($guideIds)) {
                foreach ($guideIds as $guideId) {
                    // Kiểm tra xem đã có assignment cho instance này chưa
                    $exists = TripAssignment::where('tour_instance_id', $instance->id)
                        ->where('user_id', $guideId)
                        ->exists();

                    if (!$exists) {
                        TripAssignment::create([
                            'tour_id' => $template->id, // Backward compatibility
                            'tour_instance_id' => $instance->id,
                            'user_id' => $guideId,
                            'status' => '0', // Chờ xác nhận
                        ]);
                    }
                }
            }

            DB::commit();
            Log::info('TourInstance created ID: ' . $instance->id);

            return redirect()->route('tours.show', $template)
                ->with('success', 'Đã tạo chuyến đi thành công!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi tạo TourInstance: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Danh sách instances của một template
     */
    public function index($tour)
    {
        // Route binding có thể trả về TourTemplate hoặc Tour (backward compatibility)
        $template = $tour instanceof TourTemplate
            ? $tour
            : TourTemplate::findOrFail(
                is_object($tour) && isset($tour->id) ? $tour->id : $tour
            );
        $instances = $template->instances()->orderBy('date_start', 'desc')->paginate(10);

        return Inertia::render('TourInstances/Index', [
            'template' => $template,
            'instances' => $instances,
        ]);
    }

    /**
     * Cập nhật instance
     */
    public function update(Request $request, $instanceId)
    {
        $validated = $request->validate([
            'date_start' => 'required|date',
            'limit' => 'nullable|integer|min:1',
            'price_adult' => 'nullable|numeric|min:0',
            'price_children' => 'nullable|numeric|min:0',
            'status' => 'required|in:0,1,2,3',
        ]);

        $instance = TourInstance::with('tourTemplate')->findOrFail($instanceId);

        DB::beginTransaction();
        try {
            // Tính date_end
            $dateEnd = Carbon::parse($validated['date_start'])->addDays($instance->tourTemplate->day - 1);
            $validated['date_end'] = $dateEnd;

            $instance->update($validated);

            DB::commit();
            return redirect()->back()->with('success', 'Cập nhật chuyến đi thành công!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()]);
        }
    }

    /**
     * Xóa instance
     */
    public function destroy($instanceId)
    {
        $instance = TourInstance::findOrFail($instanceId);

        // Kiểm tra xem có booking nào không
        if ($instance->bookings()->count() > 0) {
            return back()->withErrors(['error' => 'Không thể xóa chuyến đi đã có booking!']);
        }

        $instance->delete();
        return redirect()->back()->with('success', 'Xóa chuyến đi thành công!');
    }
}
