<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TaskList;

class ListController extends Controller
{
    public function index()
    {
        // Example: logged-in user id = 5
        // This will get only lists where user_id = 5
        $lists = TaskList::where('user_id', auth()->id())
                         ->with('tasks')             // Also load tasks inside each list
                         ->get();                    // Run the query

        // Send data to the React page 'Lists/index'
        return Inertia::render('Lists/index', [
            'lists' => $lists,                       // Example: [{id:1,name:"Work"}, {id:2,name:"Home"}]
            'flash' => [
                'success' => session('success'),     // Example: "List created!"
                'error' => session('error')          // Example: "Something went wrong"
            ]
        ]);
    }

    public function create()
    {
        // Not used because form is in React modal
    }

    public function store(Request $request)
    {
        // Validate form fields
        // Example input:
        // name = "Shopping List"
        // description = "Buy milk"
        $validated = $request->validate([
            'name' => 'required|string|max:255',     // Must have a name like "Work List"
            'description' => 'nullable|string',      // Description is optional
        ]);

        // Create a new list in the database
        TaskList::create([
            ...$validated,                           // Adds name + description
            'user_id' => auth()->id(),               // Example: user_id = 5
        ]);

        // Redirect back to lists page with a success message
        return redirect()->route('lists.index')
                         ->with('success', 'List created successfully.');
    }

    public function show(string $id)
    {
        // Not used
    }

    public function edit(string $id)
    {
        // Not used
    }

    public function update(Request $request, TaskList $list)
    {
        // Validate new data
        // Example update:
        // name = "Updated List Name"
        // description = "Updated details"
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Update the selected list record
        $list->update($validated);

        return redirect()->route('lists.index')
                         ->with('success', 'List updated successfully.');
    }

    public function destroy(TaskList $list)
    {
        // Example: deleting list with id=10
        $list->delete();                             // Removes the list from database

        return redirect()->route('lists.index')
                         ->with('success', 'List Deleted Successfully');
    }
}
