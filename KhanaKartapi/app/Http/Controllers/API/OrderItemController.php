<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\OrderItem;

class OrderItemController extends Controller
{
    public function updateItemStatus(Request $request, $orderId, $menuItemId)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,served,cancelled',
        ]);

        $item = OrderItem::where('order_id', $orderId)
            ->where('menu_item_id', $menuItemId)
            ->firstOrFail();

        $item->status = $request->status;
        $item->save();

        return response()->json([
            'message' => 'Item status updated',
            'item' => $item,
        ]);
    }
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,served,cancelled',
        ]);

        $item = OrderItem::findOrFail($id);
        $item->status = $request->status;
        $item->save();

        return response()->json([
            'message' => 'Item status updated successfully',
            'item' => $item,
        ]);
    }
}
