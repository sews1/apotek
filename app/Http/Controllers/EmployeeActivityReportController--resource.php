<?php

namespace App\Http\Controllers;

use App\Models\ActivityReport;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeActivityReportController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'employee_id' => 'nullable|integer|exists:employees,id',
                'activity_type' => 'nullable|string'
            ]);

            // Ambil data filter dari request
            $filters = [
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'employee_id' => $validated['employee_id'] ?? null,
                'activity_type' => $validated['activity_type'] ?? null,
            ];

            // Query untuk laporan aktivitas
            $activityReports = ActivityReport::with(['employee', 'employee.role'])
                ->filter($filters)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($activity) {
                    return [
                        'activity_id' => $activity->id,
                        'created_at' => $activity->created_at,
                        'employee_id' => $activity->employee_id,
                        'employee_name' => $activity->employee->name ?? 'Unknown',
                        'role_name' => $activity->employee->role->name ?? 'No Role',
                        'activity_type' => $activity->activity_type,
                        'description' => $activity->description,
                        'ip_address' => $activity->ip_address,
                        'user_agent' => $activity->user_agent,
                    ];
                });

            // Ambil data untuk dropdown filter
            $employees = Employee::with('role')
                ->orderBy('name')
                ->get(['id', 'name', 'role_id']);

            $activityTypes = ActivityReport::getActivityTypes();

            return Inertia::render('Reports/EmployeeActivities', [
                'activityReports' => $activityReports,
                'employees' => $employees,
                'activityTypes' => $activityTypes,
                'filters' => $filters,
            ]);

        } catch (\Exception $e) {
            return Inertia::render('Reports/EmployeeActivities', [
                'error' => 'Terjadi kesalahan saat memuat laporan: ' . $e->getMessage(),
                'activityReports' => [],
                'employees' => [],
                'activityTypes' => [],
                'filters' => [],
            ]);
        }
    }
}