<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'task_code',
        'title',
        'description',
        'category_id',
        'priority',
        'status',
        'start_date',
        'due_date',
        'created_by_user_id',
        'additional_instructions',
        'progress_percent',
        'completed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'progress_percent' => 'integer',
        'completed_at' => 'datetime',
    ];

    protected $appends = [
        'is_overdue',
        'effective_status',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(TaskCategory::class, 'category_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TaskAssignment::class);
    }

    public function progresses(): HasMany
    {
        return $this->hasMany(TaskProgress::class)->latest();
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(TaskReport::class)->latest();
    }

    public function getIsOverdueAttribute(): bool
    {
        if (in_array($this->status, ['COMPLETED', 'CANCELLED'])) {
            return false;
        }

        return $this->due_date ? Carbon::parse($this->due_date)->isPast() && ! Carbon::parse($this->due_date)->isToday() : false;
    }

    public function getEffectiveStatusAttribute(): string
    {
        if ($this->is_overdue) {
            return 'OVERDUE';
        }

        return $this->status;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotIn('status', ['COMPLETED', 'CANCELLED']);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'COMPLETED');
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
            ->whereDate('due_date', '<', Carbon::today());
    }
}
