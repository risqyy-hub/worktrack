<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\PersonalNote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeePersonalNoteController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $search = $request->input('search');
        $onlyFavorites = $request->boolean('favorite');

        $query = PersonalNote::where('user_id', $userId);

        if ($onlyFavorites) {
            $query->where('is_favorite', true);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $notes = $query->orderBy('is_favorite', 'desc')
            ->latest('updated_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Employee/Notes/Index', [
            'notes' => $notes,
            'filters' => [
                'search' => $search,
                'favorite' => $onlyFavorites,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $note = PersonalNote::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'color' => $validated['color'] ?? '#FFFFFF',
            'is_favorite' => false,
        ]);

        return back()->with('success', 'Catatan pribadi berhasil disimpan.');
    }

    public function update(Request $request, PersonalNote $note): RedirectResponse
    {
        if ($note->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $note->update($validated);

        return back()->with('success', 'Catatan berhasil diperbarui.');
    }

    public function toggleFavorite(Request $request, PersonalNote $note): RedirectResponse
    {
        if ($note->user_id !== $request->user()->id) {
            abort(403);
        }

        $note->update(['is_favorite' => ! $note->is_favorite]);

        return back()->with('success', $note->is_favorite ? 'Ditambahkan ke favorit.' : 'Dihapus dari favorit.');
    }

    public function destroy(Request $request, PersonalNote $note): RedirectResponse
    {
        if ($note->user_id !== $request->user()->id) {
            abort(403);
        }

        $note->delete();

        return back()->with('success', 'Catatan berhasil dihapus.');
    }
}
