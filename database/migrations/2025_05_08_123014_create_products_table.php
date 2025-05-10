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
            $table->decimal('purchase_price', 10, 2); // Harga beli
            $table->decimal('selling_price', 10, 2); // Harga jual
            $table->integer('stock'); // Stok tersedia
            $table->integer('min_stock')->default(0); // Stok minimum
            $table->string('unit'); // Satuan produk (tablet, strip, botol, dll)
            $table->string('image')->nullable(); // Gambar produk (jika ada)
            $table->timestamps(); // created_at dan updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
