<?php

namespace App\Notifications;

use App\Models\Payroll;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PayrollPaidNotification extends Notification
{
    use Queueable;

    public function __construct(public Payroll $payroll) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $formatted = 'Rp '.number_format((float) $this->payroll->net_salary, 0, ',', '.');

        return [
            'type' => 'PAYROLL_PAID',
            'payroll_id' => $this->payroll->id,
            'title' => 'Gaji Telah Dibayarkan',
            'message' => "Pembayaran gaji periode {$this->payroll->period->name} sebesar {$formatted} telah dikonfirmasi.",
            'reference_number' => $this->payroll->reference_number,
            'url' => route('employee.payrolls.show', $this->payroll->id),
        ];
    }
}
