<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'report_code',
        'task_id',
        'task_assignment_id',
        'employee_id',
        'title',
        'work_description',
        'result_summary',
        'obstacles',
        'progress_percent',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'progress_percent' => 'integer',
        'submitted_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(TaskAssignment::class, 'task_assignment_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ReportAttachment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ReportReview::class)->latest();
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(ReportRevision::class)->latest();
    }
}
