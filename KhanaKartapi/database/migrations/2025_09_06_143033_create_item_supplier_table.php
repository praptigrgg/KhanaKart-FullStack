<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// migration for creating item_supplier pivot table
class CreateItemSupplierTable extends Migration
{
    public function up()
    {
        Schema::create('item_supplier', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->onDelete('cascade'); // Foreign key to items
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade'); // Foreign key to suppliers
            $table->decimal('purchase_price', 8, 2); // Price at which the item was bought from this supplier
            $table->timestamps(); // Created and Updated timestamps
        });
    }

    public function down()
    {
        Schema::dropIfExists('item_supplier');
    }
}
