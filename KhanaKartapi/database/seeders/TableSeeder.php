<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Table;

class TableSeeder extends Seeder
{
    public function run()
    {

        for ($i = 1; $i <= 15; $i++) {
            Table::create([
                'table_number' => $i,
                'status' => 'available'
            ]);
        }
    }
}
