<?php

namespace App\Http\Controllers\API;

use App\Models\Table;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TableController extends Controller
{
    // Get all tables
    public function index()
    {
        $tables = Table::orderBy('table_number')->get();
        return response()->json($tables);
    }

    // Bulk create tables
    public function bulkCreate(Request $request)
    {
        $request->validate([
            'count' => 'required|integer|min:1',
            'capacity' => 'required|integer|min:1',
        ]);

        $count = $request->input('count');
        $capacity = $request->input('capacity');

        // Get current max table number to continue from there
        $maxNumber = Table::max('table_number') ?? 0;

        $newTables = [];
        for ($i = 1; $i <= $count; $i++) {
            $table = Table::create([
                'table_number' => $maxNumber + $i,
                'capacity' => $capacity,
                'status' => 'available',
            ]);
            $newTables[] = $table;
        }

        return response()->json($newTables, 201);
    }
    public function update(Request $request, $id)
{
    // Validate the input
    $validated = $request->validate([
        'capacity' => 'required|integer|min:1',
        'status' => 'required|string|in:available,occupied,reserved',
    ]);

    // Find the table by ID
    $table = Table::find($id);

    if (!$table) {
        return response()->json(['message' => 'Table not found'], 404);
    }

    // Update the table
    $table->capacity = $validated['capacity'];
    $table->status = $validated['status'];
    $table->save();

    return response()->json($table);
}
public function destroy($id)
{
    $table = Table::find($id);

    if (!$table) {
        return response()->json(['message' => 'Table not found'], 404);
    }

    $table->delete();

    return response()->json(['message' => 'Table deleted']);
}

}
