<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'table_id' => 'required|exists:tables,id',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount' => 'nullable|numeric|min:0|max:100',
        ]);

        $table = Table::findOrFail($validated['table_id']);

        $existingOrder = Order::where('table_id', $table->id)
            ->where('is_paid', false)
            ->whereIn('status', ['pending', 'preparing', 'ready', 'served'])
            ->first();

        if ($existingOrder) {
            foreach ($validated['items'] as $item) {
                $existingItem = $existingOrder->items()->where('menu_item_id', $item['menu_item_id'])->first();
                if ($existingItem) {
                    $existingItem->quantity += $item['quantity'];
                    $existingItem->save();
                } else {
                    $existingOrder->items()->create($item);
                }
            }

            $existingOrder->load(['items.menuItem', 'table']);

            return response()->json([
                'message' => 'Items added to existing order',
                'order' => $existingOrder->append('total_amount'),
            ]);
        }

        $table->update(['status' => 'occupied']);

        $order = Order::create([
            'table_id' => $table->id,
            'user_id' => Auth::id(),
            'status' => 'pending',
            'discount' => $validated['discount'] ?? 0,
        ]);

        foreach ($validated['items'] as $item) {
            $order->items()->create([
                'menu_item_id' => $item['menu_item_id'],
                'quantity' => $item['quantity'],
                'status' => 'pending',
            ]);
        }

        $order->load(['items.menuItem', 'table']);

        return response()->json([
            'message' => 'New order created',
            'order' => $order->append('total_amount'),
        ], 201);
    }

    public function index(Request $request)
    {
        $status = $request->query('status');

        $query = Order::with(['items.menuItem', 'table'])->latest();

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->paginate(20);

        $orders->getCollection()->transform(function ($order) {
            return $order->append('total_amount');
        });

        return response()->json($orders);
    }

 // In your controller methods, transform the response:
public function show($id)
{
    $order = Order::with(['items.menuItem', 'table'])->findOrFail($id);

    // Transform items to include both menuItem and menu_item for compatibility
    $order->items->each(function ($item) {
        $item->menu_item = $item->menuItem;
        return $item;
    });

    return response()->json($order->append('total_amount'));
}
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,served,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        $order->load(['items.menuItem', 'table']);

        return response()->json([
            'message' => 'Order status updated',
            'order' => $order->append('total_amount'),
        ]);
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);

        if ($order->is_paid) {
            return response()->json(['message' => 'Cannot delete a paid order'], 400);
        }

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function markPaid(Request $request, $id)
{
    $order = Order::with(['items.menuItem', 'table'])->findOrFail($id);

    if ($order->is_paid) {
        return response()->json(['message' => 'Already paid', 'order' => $order->append('total_amount')], 400);
    }

    $order->is_paid = true;
    $order->paid_at = now();

    $paymentMethod = $request->input('payment_method', 'cash');
    $discount = $request->input('discount', 0); // Add this line

    $allowedMethods = ['cash', 'card', 'qr'];

    if (!in_array($paymentMethod, $allowedMethods)) {
        return response()->json(['message' => 'Invalid payment method'], 400);
    }

    $order->payment_method = $paymentMethod;

    // Apply discount if provided
    if ($discount > 0) {
        $order->discount = $discount;
    }

    $order->save();

    if ($order->table_id) {
        $table = Table::find($order->table_id);
        if ($table) {
            $table->status = 'available';
            $table->save();
        }
    }

    return response()->json(['message' => 'Marked paid', 'order' => $order->append('total_amount')]);
}

    public function addItems(Request $request, $id)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $order = Order::findOrFail($id);

        if ($order->is_paid) {
            return response()->json(['message' => 'Cannot add items to a paid order'], 400);
        }

        foreach ($validated['items'] as $item) {
            $existingItem = $order->items()->where('menu_item_id', $item['menu_item_id'])->first();
            if ($existingItem) {
                $existingItem->quantity += $item['quantity'];
                $existingItem->save();
            } else {
                $order->items()->create([
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'status' => 'pending',
                ]);
            }
        }

        $order->load(['items.menuItem', 'table']);

        return response()->json([
            'message' => 'Items added to order',
            'order' => $order->append('total_amount'),
        ]);
    }
}
