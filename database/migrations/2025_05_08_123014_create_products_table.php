<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id(); // ID auto increment
            $table->string('code')->unique(); // Kode produk unik (misalnya kode obat)
            $table->string('name'); // Nama produk
            $table->foreignId('category_id')->constrained()->onDelete('cascade'); // Relasi ke kategori
            $table->text('description')->nullable(); // Deskripsi produk (opsional)
            $table->integer('purchase_price'); // Harga beli
            $table->integer('selling_price'); // Harga jual
            $table->integer('stock'); // Stok tersedia
            $table->integer('min_stock')->default(0); // Stok minimum
            $table->string('unit'); // Satuan produk (tablet, strip, botol, dll)
            $table->string('image')->nullable(); // Gambar produk (jika ada)
            $table->date('entry_date')->nullable(); // Tanggal masuk produk
            $table->date('expired_date')->nullable();
            $table->boolean('is_active')->default(true); 
            $table->timestamps(); // created_at dan updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
