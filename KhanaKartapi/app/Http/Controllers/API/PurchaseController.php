<?php

namespace App\Http\Controllers\API;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PurchaseController extends Controller
{
    public function store(Request $request, $item_id)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'quantity' => 'required|integer',
            'price' => 'required|numeric',
            'type' => 'required|in:increase,decrease', // Stock increase or decrease
        ]);

        $item = Item::findOrFail($item_id);
        $supplier = Supplier::findOrFail($request->supplier_id);

        // Handle stock increase or decrease
        if ($request->type == 'increase') {
            $item->quantity += $request->quantity;
        } else {
            $item->quantity -= $request->quantity;
        }
        $item->save();

        // Log the purchase transaction
        $purchase = Purchase::create([
            'item_id' => $item->id,
            'supplier_id' => $supplier->id,
            'quantity' => $request->quantity,
            'price' => $request->price,
            'type' => $request->type,
        ]);

        return response()->json($purchase, 201);
    }
}

