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
        Schema::create('shop_category_shop_product', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Shop\ShopCategory::class);
            $table->foreignIdFor(\App\Models\Shop\ShopProduct::class);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_category_shop_product');
    }
};
