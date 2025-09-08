<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// migration for creating purchases table
class CreatePurchasesTable extends Migration
{
    public function up()
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->onDelete('cascade'); // Foreign key to items
            $table->foreignId('supplier_id')->nullable()->constrained()->onDelete('set null'); // Optional supplier
            $table->integer('quantity'); // Quantity of items purchased
            $table->decimal('price', 8, 2)->nullable(); // Price can be null for stock decreases
            $table->enum('type', ['increase', 'decrease']); // Stock increase or decrease
            $table->timestamps(); // Created and Updated timestamps
        });
    }

    public function down()
    {
        Schema::dropIfExists('purchases');
    }
}
