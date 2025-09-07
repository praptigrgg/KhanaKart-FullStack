<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = ['name', 'quantity', 'unit', 'price'];

    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class, 'item_supplier')
                    ->withPivot('purchase_price') // Includes purchase price from supplier
                    ->withTimestamps();
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
