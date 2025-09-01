<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'category',
        'is_available',
    ];
    public function orderItems()
{
    return $this->hasMany(\App\Models\OrderItem::class);
}

public function orders()
{
    return $this->belongsToMany(\App\Models\Order::class, 'order_items');
}

}
