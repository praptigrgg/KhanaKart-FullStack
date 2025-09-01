<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'table_id',
        'table_number',
        'user_id',
        'status',
        'discount'
    ];

    protected $appends = ['total_amount'];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function menuItems()
    {
        return $this->belongsToMany(\App\Models\MenuItem::class, 'order_items');
    }

    public function getTotalAmountAttribute()
    {
        $subtotal = $this->items->sum(function ($item) {
            return $item->menuItem->price * $item->quantity;
        });

        $discountAmount = ($this->discount / 100) * $subtotal;
        return round($subtotal - $discountAmount, 2);
    }
}
