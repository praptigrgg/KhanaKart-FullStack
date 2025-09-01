<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Table;

class TableController extends Controller
{
    public function index()
    {
        return Table::all();
    }
}
