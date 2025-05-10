<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Menambahkan kolom total_amount
            $table->decimal('total_amount', 10, 2)->default(0)->after('customer_name');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Menghapus kolom total_amount jika rollback
            $table->dropColumn('total_amount');
        });
    }
};
