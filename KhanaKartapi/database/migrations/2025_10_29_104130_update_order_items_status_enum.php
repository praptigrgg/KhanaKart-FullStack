<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'cancelled' to the enum
        DB::statement("ALTER TABLE order_items MODIFY COLUMN status ENUM('pending', 'preparing', 'ready', 'served', 'cancelled') DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Revert back to original enum
        DB::statement("ALTER TABLE order_items MODIFY COLUMN status ENUM('pending', 'preparing', 'ready', 'served') DEFAULT 'pending'");
    }
};
