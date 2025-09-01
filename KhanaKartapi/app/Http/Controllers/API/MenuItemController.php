<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    // List all menu items
    public function index()
    {
        return MenuItem::all();
    }

    // Add new menu item (admin only)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'is_available' => 'boolean'
        ]);

        $item = MenuItem::create($request->all());
        return response()->json($item, 201);
    }

    // Show single item
    public function show($id)
    {
        return MenuItem::findOrFail($id);
    }

    // Update item
    public function update(Request $request, $id)
    {
        $item = MenuItem::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    // Delete item
    public function destroy($id)
    {
        $item = MenuItem::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
