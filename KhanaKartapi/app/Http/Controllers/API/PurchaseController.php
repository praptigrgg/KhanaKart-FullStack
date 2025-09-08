<?php

namespace App\Http\Controllers\API;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PurchaseController extends Controller
{
    public function index()
    {
        return Purchase::with(['item','supplier'])->get();
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'item_id' => 'required|exists:items,id',
        'supplier_id' => 'nullable|exists:suppliers,id',
        'quantity' => 'required|integer|min:1',
        'price' => 'nullable|numeric',
        'type' => 'required|in:increase,decrease',
    ]);

    $purchase = Purchase::create($validated);

    $item = Item::findOrFail($validated['item_id']);

    if ($validated['type'] === 'increase') {
        $item->quantity += $validated['quantity']; // ✅ add to stock
    } elseif ($validated['type'] === 'decrease') {
        if ($item->quantity < $validated['quantity']) {
            return response()->json(['error' => 'Not enough stock to decrease'], 400);
        }
        $item->quantity -= $validated['quantity']; // ✅ subtract from stock
    }

    $item->save();

    return response()->json($purchase, 201);
}


}
