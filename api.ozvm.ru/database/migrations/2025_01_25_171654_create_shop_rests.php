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
        Schema::create('shop_rests', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Shop\ShopProduct::class);
            $table->foreignIdFor(\App\Models\Shop\ShopStorage::class);
            $table->integer('value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_rests');
    }
};
