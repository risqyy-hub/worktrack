<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_report_id',
        'revision_number',
        'feedback_notes',
        'employee_response',
        'status',
        'resolved_at',
    ];

    protected $casts = [
        'revision_number' => 'integer',
        'resolved_at' => 'datetime',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(TaskReport::class, 'task_report_id');
    }
}
