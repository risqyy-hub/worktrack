<?php

namespace App\Notifications;

use App\Models\TaskReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReportReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public TaskReport $report,
        public string $status,
        public string $notes
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $statusLabels = [
            'APPROVED' => 'Disetujui',
            'REVISION_REQUESTED' => 'Perlu Revisi',
            'REJECTED' => 'Ditolak',
        ];

        return [
            'type' => 'REPORT_REVIEWED',
            'report_id' => $this->report->id,
            'title' => 'Laporan Diperiksa General Manager',
            'message' => "Laporan {$this->report->report_code} untuk tugas {$this->report->task->title} telah {$statusLabels[$this->status]}.",
            'status' => $this->status,
            'notes' => $this->notes,
            'url' => route('employee.reports.show', $this->report->id),
        ];
    }
}
