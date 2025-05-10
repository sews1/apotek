<!DOCTYPE html>
<html>
<head>
    <title>Invoice #{{ $sale->invoice_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0; }
        .info { margin-bottom: 20px; }
        .info table { width: 100%; }
        .info table td { padding: 5px 0; }
        .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $company['name'] }}</h1>
        <p>{{ $company['address'] }}</p>
        <p>Telp: {{ $company['phone'] }}</p>
    </div>

    <div class="info">
        <table>
            <tr>
                <td width="30%"><strong>No. Invoice</strong></td>
                <td>: {{ $sale->invoice_number }}</td>
            </tr>
            <tr>
                <td><strong>Tanggal</strong></td>
                <td>: {{ $sale->created_at->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td><strong>Kasir</strong></td>
                <td>: {{ $sale->user->name }}</td>
            </tr>
            @if($sale->customer_name)
            <tr>
                <td><strong>Pelanggan</strong></td>
                <td>: {{ $sale->customer_name }}</td>
            </tr>
            @endif
        </table>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th>Produk</th>
                <th>Harga</th>
                <th>Qty</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                <td>{{ $item->quantity }}</td>
                <td>Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total">
        <p><strong>Total: Rp {{ number_format($sale->total, 0, ',', '.') }}</strong></p>
        <p><strong>Pembayaran: {{ ucfirst($sale->payment_method) }}</strong></p>
    </div>

    <div class="footer">
        <p>Terima kasih telah berbelanja di {{ $company['name'] }}</p>
        <p>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan</p>
    </div>
</body>
</html>