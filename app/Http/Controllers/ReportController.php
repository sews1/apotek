<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        $weeklySales = $this->getWeeklySales();
        $monthlySales = $this->getMonthlySales();
        $yearlySales = $this->getYearlySales();

        return Inertia::render('Reports/Index', [
            'weeklySales' => $weeklySales,
            'monthlySales' => $monthlySales,
            'yearlySales' => $yearlySales,
        ]);
    }

    public function weekly()
    {
        $weeklySales = $this->getWeeklySales();

        return Inertia::render('Reports/Weekly', [
            'weeklySales' => $weeklySales,
        ]);
    }

    public function monthly()
    {
        $monthlySales = $this->getMonthlySales();

        return Inertia::render('Reports/Monthly', [
            'monthlySales' => $monthlySales,
        ]);
    }

    public function yearly()
    {
        $yearlySales = $this->getYearlySales();

        return Inertia::render('Reports/Yearly', [
            'yearlySales' => $yearlySales,
        ]);
    }

    // ------------------ Private Helper Functions ------------------ //

    private function getWeeklySales()
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        return Sale::whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sale) {
                return [
                    'date' => $sale->created_at->format('Y-m-d'),
                    'invoice' => $sale->invoice,
                    'customer' => $sale->customer_name,
                    'total' => $sale->total,
                ];
            });
    }

    private function getMonthlySales()
    {
        return Sale::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sale) {
                return [
                    'date' => $sale->created_at->format('Y-m-d'),
                    'invoice' => $sale->invoice,
                    'customer' => $sale->customer_name,
                    'total' => $sale->total,
                ];
            });
    }

    private function getYearlySales()
    {
        return Sale::whereYear('created_at', now()->year)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sale) {
                return [
                    'date' => $sale->created_at->format('Y-m-d'),
                    'invoice' => $sale->invoice,
                    'customer' => $sale->customer_name,
                    'total' => $sale->total,
                ];
            });
    }
}
