<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Task;
use App\Models\TaskList;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    // 1. START THE SHOPPING LIST
    // We aren't getting data yet. We are preparing the query.
    // "Task::with('list')" means: Get Tasks, but also grab the 'List' details (category) for each one right now.
    $query = Task::with('list')
        // SECURITY CHECK: Only show tasks where the related 'list' belongs to the logged-in user.
        ->whereHas('list', function ($query) {
            $query->where('user_id', auth()->id());
        })
        // Sort the results: Newest items (created_at) come first.
        ->orderBy('created_at', 'desc');


    // 2. SEARCH LOGIC
    // Check: Did the user type something in the search bar?
    // (Note: I removed the extra ';' you had here, as it breaks the code)
    if(request()->has('search'))
    {
        // Get the word the user typed (e.g., "meeting")
        $search = request()->input('search');

        // Add a rule: The 'title' OR 'description' must match that word.
        // We group them in a function so the logic stays together.
        $query->where(function($query) use ($search) {
            $query->where('title', 'like', "%{$search}%")       // % means it can be part of a word
                  ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // 3. FILTER LOGIC
    // Check: Did the user select a filter? And is that filter NOT "all"?
    if(request()->has('filter') && request('filter') !== 'all')
    {
        // If they chose 'completed', look for true. Otherwise, look for false.
        $query->where('is_completed', request('filter') === 'completed' ? true : false);
    }

    // 4. GO TO THE DATABASE
    // Finally, run the query we built above.
    // "paginate(10)" means only give me 10 tasks (for page 1), not all of them.
    $tasks = $query->paginate(10);

    // Get all the TaskLists (categories) for this user.
    // We need these to show a dropdown menu on the page.
    $lists = TaskList::where('user_id', auth()->id())->get();

    // 5. SEND TO SCREEN (FRONTEND)
    // Send the data to the 'Tasks/index' page (React file).
    return Inertia::render('Tasks/index', [
        'tasks' => $tasks,    // The 10 tasks we found
        'lists' => $lists,    // The categories for the dropdown
        
        // Pass the search/filter inputs back to the page 
        // (so the search box doesn't go blank after reloading)
        'filters' => [
            'search' => request('search', ''),
            'filter' => request('filter', ''),
        ],
        
        // Flash messages are temporary popups (like "Task Deleted!")
        'flash' => [
            'success' => session('success'),
            'error' => session('error')
        ]
    ]);
}
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
   public function store(Request $request)
{
    // 1. VALIDATION (The Security Check)
    // We define the rules. If the user breaks a rule, Laravel kicks them back automatically.
    // The result is stored in '$validated', which is a clean array of data.
    $validated = $request->validate([
        'title'        => 'required|string|max:255', // Must contain text, max 255 chars
        'description'  => 'nullable|string',         // Can be empty
        'due_date'     => 'nullable|date',           // Can be empty, but if filled, must be a date format
        
        // IMPORTANT: Check if the category (list) actually exists in the database table 'lists'
        'list_id'      => 'required|exists:lists,id', 
        
        'is_completed' => 'required|boolean',        // Must be true or false (1 or 0)
    ]);

    // 2. CREATE THE RECORD
    // Use the 'Task' model to create a new row in the database using the clean data.
    Task::create($validated);

    // 3. REDIRECT
    // Send the user back to the 'index' page (the main list).
    // Attach a temporary "success" message for the notification popup.
    return redirect()->route('tasks.index')
                     ->with('success', 'Task created successfully.');
}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'due_date'     => 'nullable|date',
            'list_id'      => 'required|exists:lists,id',
            'is_completed' => 'required|boolean',
        ]);
        $task->update($validated);
        return redirect()->route('tasks.index')
                         ->with('success', 'Task updated successfully.');   
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->route('tasks.index')
                         ->with('success', 'Task deleted successfully.');
    }   
}
