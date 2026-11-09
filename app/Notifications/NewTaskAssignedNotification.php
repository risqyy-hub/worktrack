<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewTaskAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(public Task $task) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'TASK_ASSIGNED',
            'task_id' => $this->task->id,
            'title' => 'Tugas Baru Diberikan',
            'message' => "Anda ditugaskan mengerjakan: {$this->task->title} ({$this->task->task_code}).",
            'priority' => $this->task->priority,
            'due_date' => $this->task->due_date?->format('d M Y'),
            'url' => route('employee.tasks.show', $this->task->id),
        ];
    }
}
