<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <title>Invoice #{{ $sale->invoice_number }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

        body {
            font-family: 'Inter', Arial, sans-serif;
            font-size: 15px;
            margin: 30px auto;
            max-width: 720px;
            color: #2c3e50;
            background: #f7f9fc;
        }

        .container {
            background: #fff;
            padding: 30px 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #2980b9;
            padding-bottom: 15px;
        }

        .header h1 {
            margin: 0;
            font-weight: 700;
            font-size: 28px;
            color: #2980b9;
        }

        .header p {
            margin: 4px 0 0 0;
            color: #7f8c8d;
            font-weight: 500;
        }

        .info {
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 15px;
        }

        .info table {
            width: 48%;
            border-collapse: collapse;
        }

        .info td {
            padding: 6px 0;
            color: #34495e;
        }

        .info td:first-child {
            font-weight: 600;
            width: 40%;
        }

        .items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        .items thead {
            background-color: #2980b9;
            color: #fff;
        }

        .items th,
        .items td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: left;
        }

        .items tbody tr:hover {
            background-color: #ecf0f1;
        }

        .items td:nth-child(2),
        .items td:nth-child(3),
        .items td:nth-child(4) {
            text-align: right;
        }

        .summary {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .summary td {
            padding: 8px 15px;
            text-align: right;
        }

        .summary td:first-child {
            text-align: left;
            font-weight: 600;
        }

        .total-row {
            font-weight: 700;
            font-size: 16px;
            color: #2980b9;
        }

        .payment-row {
            border-top: 1px solid #eee;
            padding-top: 8px;
        }

        .change-row {
            font-weight: 600;
            color: #27ae60;
        }

        .payment-method {
            font-weight: 600;
            font-size: 15px;
            color: #34495e;
            margin-top: 5px;
        }

        .footer {
            text-align: center;
            color: #95a5a6;
            font-size: 13px;
            font-style: italic;
            border-top: 1px solid #ddd;
            padding-top: 15px;
            user-select: none;
        }

        button.print-btn {
            display: inline-block;
            background-color: #2980b9;
            color: white;
            border: none;
            padding: 12px 28px;
            font-size: 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            box-shadow: 0 4px 8px rgba(41, 128, 185, 0.4);
        }

        button.print-btn:hover {
            background-color: #1c5d8b;
        }

        .no-print {
            text-align: center;
            margin-top: 20px;
        }

        .barcode {
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            border-top: 1px dashed #ccc;
            border-bottom: 1px dashed #ccc;
        }

        @media print {
            body {
                margin: 0;
                background: #fff;
                -webkit-print-color-adjust: exact;
            }

            .no-print {
                display: none;
            }

            .container {
                box-shadow: none;
                margin: 0;
                padding: 0;
                max-width: 100%;
                border-radius: 0;
            }

            .items th {
                background-color: #2980b9 !important;
                -webkit-print-color-adjust: exact;
                color: white !important;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Apotek Hero Farma</h1>
            <p>Jl. Ngemplak, Ngampo, Kismoyoso, Kec. Ngemplak, Kabupaten Boyolali, Jawa Tengah 57375</p>
            <p>Telp: 08123456789 | NPWP: 01.234.567.8-912.345</p>
        </div>

        <div class="info">
            <table>
                <tr>
                    <td>No. Invoice</td>
                    <td>: {{ $sale->invoice_number }}</td>
                </tr>
                <tr>
                    <td>Tanggal</td>
                    <td>: {{ $sale->created_at->format('d/m/Y H:i') }}</td>
                </tr>
                <tr>
                    <td>Kasir</td>
                    <td>: {{ $sale->user->name }}</td>
                </tr>
                @if ($sale->customer_name)
                    <tr>
                        <td>Pelanggan</td>
                        <td>: {{ $sale->customer_name }}</td>
                    </tr>
                @endif
            </table>
        </div>

        <table class="items" cellspacing="0" cellpadding="0">
            <thead>
                <tr>
                    <th>Produk</th>
                    <th>Harga</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($sale->items as $item)
                    <tr>
                        <td>{{ $item->product->name }}</td>
                        <td>Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                        <td>{{ $item->quantity }}</td>
                        <td>Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="summary">
            {{-- <tr>
                <td>Subtotal</td>
                <td>Rp {{ number_format($sale->subtotal, 0, ',', '.') }}</td>
            </tr> --}}
            @if ($sale->discount > 0)
                <tr>
                    <td>Diskon</td>
                    <td>Rp {{ number_format($sale->discount, 0, ',', '.') }}</td>
                </tr>
            @endif
            <tr class="total-row">
                <td>Total</td>
                <td>Rp {{ number_format($sale->total, 0, ',', '.') }}</td>
            </tr>
            <tr class="payment-row">
                <td>Uang Diterima</td>
                {{-- <td>Rp {{ number_format($sale->amount_received - $sale->total, 0, ',', '.') }}</td> --}}
                <td>Rp {{ number_format($sale->payment_amount, 0, ',', '.') }}</td>
            </tr>
            <tr class="change-row">
                <td>Kembalian</td>
                <td>Rp {{ number_format($sale->change_amount, 0, ',', '.') }}</td>
            </tr>
        </table>

        <div class="payment-method">
            Metode Pembayaran: {{ ucfirst($sale->payment_method) }}
        </div>

        <div class="barcode">
            {{ $sale->invoice_number }} | {{ $sale->created_at->format('dmY') }}
        </div>

        <div class="footer">
            <p>Terima kasih telah berbelanja di Apotek Hero Farma</p>
            <p><small>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan</small></p>
            <p><small>*Simpan invoice ini sebagai bukti pembelian</small></p>
        </div>
    </div>

    <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Cetak Invoice</button>
    </div>
</body>

</html>
