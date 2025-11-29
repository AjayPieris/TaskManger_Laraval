<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TaskList;

class ListController extends Controller
{
   public function index()
{
    // Get all task lists for the logged-in user and include their tasks
    $lists = TaskList::where('user_id', auth()->id())  // Filter lists by current user
                     ->with('tasks')                   // Load related tasks for each list
                     ->get();                           // Execute query and get results

    // Return the page using Inertia.js and pass data to the frontend
    return Inertia::render('Lists/index', [            // Render the 'Lists/index' frontend page
        'lists' => $lists,                             // Pass the task lists and their tasks
        'flash' => [                                   // Pass flash messages to the page
            'success' => session('success'),          // Temporary success message
            'error' => session('error')               // Temporary error message
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        TaskList::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);
        return redirect()->route('lists.index')->with('success', 'List created successfully.');
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
    public function update(Request $request, TaskList $list)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $list->update($validated);
        return redirect()->route('lists.index')->with('success', 'List updated successfully.');
       
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskList $list)
    {
        $list->delete();
        return redirect()->route('lists.index')->with('success', 'List Deleted Successfully');
    }
}
