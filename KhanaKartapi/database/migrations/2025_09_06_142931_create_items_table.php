<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// migration for creating items table
class CreateItemsTable extends Migration
{
    public function up()
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Item name
            $table->integer('quantity')->default(0); // Quantity of the item in stock
            $table->string('unit'); // Unit of measurement (e.g., kg, liters)
            $table->decimal('price', 8, 2)->nullable(); // Item price (can be set dynamically based on suppliers)
            $table->timestamps(); // Created and Updated timestamps
        });
    }

    public function down()
    {
        Schema::dropIfExists('items');
    }
}
