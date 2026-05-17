<?php

use App\Models\Shop\ShopProduct;
use App\Models\User;
use App\Models\Shop\ShopOrder;
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
        Schema::create('shop_order_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('external_id')->index()->nullable();

            $table->foreignIdFor(ShopOrder::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignIdFor(ShopProduct::class)->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('title');
            $table->string('image')->nullable();
            $table->decimal('quantity', 11, 2)->default(1);
            $table->decimal('price', 11, 2)->default(0);
            $table->decimal('total', 11, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_order_items');
    }
};
