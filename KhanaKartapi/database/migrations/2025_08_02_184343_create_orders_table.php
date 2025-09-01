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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->enum('status', ['pending', 'preparing', 'ready', 'served'])->default('pending');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // waiter who created the order
            $table->foreignId('table_id')->constrained()->onDelete('cascade');
            $table->decimal('discount', 5, 2)->default(0);
            $table->enum('payment_method', ['cash', 'qr'])->default('cash');
            $table->boolean('is_paid')->default(false);
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
