<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
{
    $orders = Order::with('items.menuItem', 'table')
        ->latest()
        ->get();

    $invoices = $orders->map(function ($order) {
        $subtotal = $order->items->sum(fn($item) => $item->menuItem->price * $item->quantity);
        $discountAmount = round(($order->discount / 100) * $subtotal, 2);
        $total = $subtotal - $discountAmount;

        return [
            'id' => $order->id,
            'invoice_number' => 'INV-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            'table_number' => $order->table->table_number,
            'items' => $order->items->map(function ($item) {
                return [
                    'name' => $item->menuItem->name,
                    'quantity' => $item->quantity,
                    'price' => $item->menuItem->price,
                    'subtotal' => $item->quantity * $item->menuItem->price,
                ];
            }),
            'subtotal' => $subtotal,
            'discount_percent' => $order->discount,
            'discount_amount' => $discountAmount,
            'total' => $total,
            'status' => $order->status,
'is_paid' => $order->is_paid ?? false,
        ];
    });

    return response()->json($invoices);
}

   public function show($id)
{
    $order = Order::with('items.menuItem', 'table')->findOrFail($id);

    $subtotal = $order->items->sum(fn($item) => $item->menuItem->price * $item->quantity);
    $discountAmount = round(($order->discount / 100) * $subtotal, 2);
    $total = $subtotal - $discountAmount;

    return response()->json([
        'invoice_number' => 'INV-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
        'table_number' => $order->table->table_number,
        'items' => $order->items->map(function ($item) {
            return [
                'name' => $item->menuItem->name,
                'quantity' => $item->quantity,
                'price' => $item->menuItem->price,
                'subtotal' => $item->quantity * $item->menuItem->price,
            ];
        }),
        'subtotal' => $subtotal,
        'discount_percent' => $order->discount,
        'discount_amount' => $discountAmount,
        'total' => $total,
    ]);
}

}
