<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('activity_type', 50)->index(); // login, logout, sale, create, update, delete, view, export
            $table->text('description');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('data')->nullable(); // Additional structured data
            $table->string('session_id')->nullable()->index(); // For session tracking
            $table->timestamps();

            // Indexes for better performance
            $table->index(['user_id', 'activity_type']);
            $table->index(['user_id', 'created_at']);
            $table->index(['activity_type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};

// If you need to add columns to existing table, use this migration instead:
/*
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('activity_logs', 'data')) {
                $table->json('data')->nullable()->after('user_agent');
            }
            if (!Schema::hasColumn('activity_logs', 'session_id')) {
                $table->string('session_id')->nullable()->index()->after('data');
            }
            
            // Add indexes if they don't exist
            $table->index(['user_id', 'activity_type']);
            $table->index(['user_id', 'created_at']);
            $table->index(['activity_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropColumn(['data', 'session_id']);
            $table->dropIndex(['user_id', 'activity_type']);
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['activity_type', 'created_at']);
        });
    }
};
*/