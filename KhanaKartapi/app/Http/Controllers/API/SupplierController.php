<?php

namespace App\Http\Controllers\API;

use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SupplierController extends Controller
{
    public function index() { return Supplier::all(); }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'contact' => 'required|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
        ]);
        return Supplier::create($request->all());
    }

    public function update(Request $request, Supplier $supplier)
    {
        $supplier->update($request->all());
        return $supplier;
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return response()->noContent();
    }
}
