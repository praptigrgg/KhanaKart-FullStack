<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Role;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
   public function register(Request $request)
{
    $validRoles = Role::pluck('name')->toArray();

    $request->validate([
        'name' => 'required',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6|confirmed',
        'role' => 'required|string|in:' . implode(',', $validRoles),
    ], [
        'password.confirmed' => 'Passwords do not match.',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => bcrypt($request->password),
        'role' => $request->role,
    ]);

    $token = $user->createToken('api_token')->plainTextToken;

    return response()->json([
        'message' => 'User registered successfully!',
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ],
    ], 201);
}

    public function login(Request $request)
{
    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = User::where('email', $request->email)->first();

    return response()->json([
        'message' => 'Login successful!',
        'token' => $user->createToken('api_token')->plainTextToken,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]
    ]);
}

    public function logout(Request $request)
{
    // Revoke the current access token
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Logged out successfully!'
    ]);
}
public function dashboard(Request $request)
{
    $user = $request->user();

    switch ($user->role) {
        case 'admin':
            return $this->adminDashboard($request);
        case 'waiter':
            return $this->waiterDashboard($user);
        case 'kitchen':
            return $this->kitchenDashboard();
        default:
            return response()->json(['message' => 'Unauthorized'], 403);
    }
}

private function adminDashboard(Request $request)
{
    $date = $request->input('date') ? \Carbon\Carbon::parse($request->input('date')) : today();

    $orders = Order::with('items.menuItem')
        ->whereDate('created_at', $date)
        ->where('is_paid', true)
        ->get();

    $totalRevenue = $orders->reduce(function ($carry, $order) {
        $orderTotal = $order->items->sum(function ($item) {
            return $item->menuItem->price * $item->quantity;
        });

        if ($order->discount) {
            $orderTotal -= ($orderTotal * ($order->discount / 100));
        }

        return $carry + $orderTotal;
    }, 0);

    // Monthly data
    $monthStart = now()->startOfMonth();
    $monthOrders = Order::whereBetween('created_at', [$monthStart, now()])
        ->where('is_paid', true)
        ->get();

    $monthlyRevenue = $monthOrders->reduce(function ($carry, $order) {
        $total = $order->items->sum(function ($item) {
            return $item->menuItem->price * $item->quantity;
        });

        if ($order->discount) {
            $total -= ($total * ($order->discount / 100));
        }

        return $carry + $total;
    }, 0);

    $monthlyOrderCount = $monthOrders->count();
    $monthlyUsers = \App\Models\User::whereBetween('created_at', [$monthStart, now()])->count();

    return response()->json([
        'date' => $date->toDateString(),
        'total_orders' => $orders->count(),
        'total_revenue' => round($totalRevenue, 2),
        'top_items' => MenuItem::withCount('orders')->orderBy('orders_count', 'desc')->take(5)->get(),
        'pending_orders' => Order::where('status', 'pending')->count(),
        'total_users' => User::count(),
        'users' => User::select('id', 'name', 'email', 'role', 'created_at')->latest()->take(10)->get(),

        // New monthly data
        'monthly_orders' => $monthlyOrderCount,
        'monthly_revenue' => round($monthlyRevenue, 2),
        'monthly_users' => $monthlyUsers,
    ]);
}



private function waiterDashboard($user)
{
    // Fetch orders for the waiter role
    $ordersToday = $user->orders()->whereDate('created_at', today())->count();
    $pendingOrders = $user->orders()->where('status', 'pending')->count();

    // Optionally, show more detailed statistics
    $recentPendingOrders = $user->orders()->where('status', 'pending')->latest()->take(5)->get();

    return response()->json([
        'orders_today' => $ordersToday,
        'pending_orders' => $pendingOrders,
        'recent_pending_orders' => $recentPendingOrders, // Add the list of recent pending orders
    ]);
}

private function kitchenDashboard()
{
    // Fetch kitchen-related stats
    $inPreparation = Order::where('status', 'preparing')->count();
    $readyToServe = Order::where('status', 'ready')->count();
    $servedToday = Order::where('status', 'served')->whereDate('updated_at', today())->count();

    // Optionally, show more details on recent orders
    $recentOrders = Order::whereIn('status', ['preparing', 'ready'])->latest()->take(5)->get();

    return response()->json([
        'in_preparation' => $inPreparation,
        'ready_to_serve' => $readyToServe,
        'served_today' => $servedToday,
        'recent_orders' => $recentOrders, // Add the list of recent orders in preparation/ready
    ]);
}



}
