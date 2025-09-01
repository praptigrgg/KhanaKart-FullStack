<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use GuzzleHttp\Client;

class PaymentController extends Controller
{
    public function createPaymentRequest(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $client = new Client();

        $paymentData = [
            'merchant_id' => env('FONEPAY_MERCHANT_ID'),
            'amount' => $validated['amount'],
            'order_id' => $validated['order_id'],
            'currency' => 'INR',
            'callback_url' => route('payment.callback'),
            // Add other required fields per FonePay API
        ];

        try {
            $response = $client->post('https://api.fonepay.com/payment/create', [
                'form_params' => $paymentData,
            ]);

            $responseData = json_decode($response->getBody(), true);

            if ($responseData['status'] === 'success') {
                return response()->json([
                    'qr_code_url' => $responseData['qr_code_url'],
                    'order_id' => $validated['order_id'],
                ]);
            } else {
                return response()->json(['error' => 'Failed to create payment request'], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function paymentCallback(Request $request)
    {
        $status = $request->input('status');
        $orderId = $request->input('order_id');

        $order = Order::find($orderId);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($status === 'completed') {
            $order->status = 'paid';
            $order->save();

            return response()->json(['message' => 'Payment successful']);
        } else {
            return response()->json(['message' => 'Payment failed'], 400);
        }
    }
}
