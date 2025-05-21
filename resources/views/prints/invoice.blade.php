<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice #{{ $sale->invoice_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; margin: 30px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 2px 0; }

        .info, .total { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        .info td { padding: 4px 0; }

        .items th, .items td {
            border: 1px solid #ccc;
            padding: 8px;
        }

        .items th {
            background-color: #f9f9f9;
            text-align: left;
        }

        .total {
            text-align: right;
        }

        .total p {
            margin: 5px 0;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #777;
        }

        @media print {
            .no-print { display: none; }
            body { margin: 0; }
        }
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
            <tr><td width="30%"><strong>No. Invoice</strong></td><td>: {{ $sale->invoice_number }}</td></tr>
            <tr><td><strong>Tanggal</strong></td><td>: {{ $sale->created_at->format('d/m/Y H:i') }}</td></tr>
            <tr><td><strong>Kasir</strong></td><td>: {{ $sale->user->name }}</td></tr>
            @if($sale->customer_name)
            <tr><td><strong>Pelanggan</strong></td><td>: {{ $sale->customer_name }}</td></tr>
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
        <p>Total: Rp {{ number_format($sale->total, 0, ',', '.') }}</p>
        <p>Metode Pembayaran: {{ ucfirst($sale->payment_method) }}</p>
    </div>

    <div class="footer">
        <p>Terima kasih telah berbelanja di {{ $company['name'] }}</p>
        <p>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan</p>
    </div>

    <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">🖨️ Cetak Invoice</button>
    </div>
</body>
</html>
