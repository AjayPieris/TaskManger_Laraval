// Import Head (for setting page title), Link (for navigation links), and useForm (form helper) from Inertia React
import { Head, Link, useForm } from "@inertiajs/react";
// Import React hooks and types for events
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
// Import icons from lucide-react for buttons and toast indicators
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";

// Import a Button UI component
import { Button } from "@/components/ui/button";
// Import Card components to display list items
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Import Dialog components to show a modal for create/edit
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
// Import Input component for text input fields
import { Input } from "@/components/ui/input";
// Import Label component to label inputs
import { Label } from "@/components/ui/label";
// Import Textarea for multi-line text input (note: path is relative here)
import { Textarea } from "../../components/ui/textarea";

// Import a BreadcrumbItem type to define breadcrumb entries
import { type BreadcrumbItem } from "@/types";
// Import the main app layout wrapper that provides page frame and breadcrumbs
import AppLayout from "@/layouts/app-layout";
// Import route helpers for lists (to build URLs for create/update/delete)
import listsRoutes from "../../routes/lists";

// Define the shape of a list item returned from the server
interface ListItem {
  id: number;              // unique id of the list
  name: string;            // list name/title
  description: string;     // short description of the list
  tasks_count: number;     // number of tasks inside this list
}

// Define the props the page receives from the server via Inertia
interface Props {
  lists: ListItem[];       // all lists to render
  flash: { success?: string; error?: string }; // optional success/error message to show
}

// Define breadcrumb items to show at the top of the page
const breadcrumbItems: BreadcrumbItem[] = [{ title: "Lists", href: "/lists" }];

// Main component for the Lists index page
export default function ListsIndex({ lists, flash }: Props) {
  // 'open' controls whether the create/edit dialog is shown
  const [open, setOpen] = useState(false);
  // 'editingList' holds the list being edited; null means we are creating a new list
  const [editingList, setEditingList] = useState<ListItem | null>(null);

  // Toast visibility state (whether the toast message is shown)
  const [showToast, setShowToast] = useState(false);
  // Toast message text (what text to show inside the toast)
  const [toastMessage, setToastMessage] = useState("");
  // Toast type (changes color and icon); either "success" or "error"
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Initialize an Inertia form with default fields: name and description
  const {
    data,        // current form data values
    setData,     // function to update a form field value
    post,        // function to send a POST request (create)
    put,         // function to send a PUT request (update)
    delete: destroy, // function to send a DELETE request (delete)
    reset,       // function to reset form values to initial state
    processing,  // boolean indicating request is in progress
    errors,      // validation errors returned from the server
  } = useForm({
    name: "",          // default empty name
    description: "",   // default empty description
  });

  // Watch for 'flash' messages from the server and show a toast accordingly
  useEffect(() => {
    // If the server sent a success message
    if (flash.success) {
      setToastMessage(flash.success); // set toast text to the success message
      setToastType("success");        // set toast style to success (green)
      setShowToast(true);             // show the toast
    // If the server sent an error message
    } else if (flash.error) {
      setToastMessage(flash.error);   // set toast text to the error message
      setToastType("error");          // set toast style to error (red)
      setShowToast(true);             // show the toast
    }
  }, [flash]); // run effect whenever 'flash' changes

  // Automatically hide the toast after 3 seconds when it's shown
  useEffect(() => {
    // If toast is visible
    if (showToast) {
      // Start a timer to hide it after 3000 ms
      const timer = setTimeout(() => setShowToast(false), 3000);
      // Cleanup: if component unmounts or showToast changes, clear the timer
      return () => clearTimeout(timer);
    }
  }, [showToast]); // run effect whenever 'showToast' changes

  // When clicking "New List", prepare form for creating
  const startCreate = () => {
    setEditingList(null); // clear editing state so we know we are creating
    reset();              // reset form fields to empty defaults
    setOpen(true);        // open the dialog/modal
  };

  // When clicking "Edit" on a list card, load that list into the form and open the dialog
  const handleEdit = (list: ListItem) => {
    setEditingList(list); // set current editing list
    setData({
      name: list.name,           // prefill name with list's name
      description: list.description, // prefill description with list's description
    });
    setOpen(true);        // open the dialog/modal
  };

  // When clicking "Delete", send a DELETE request to the server
  const handleDelete = (id: number) => {
    // Call destroy with the URL built from routes and the list id
    destroy(listsRoutes.destroy.url(id), {
      onSuccess: () => {
        // Optional: handle local UI updates; Inertia may reload data automatically
      },
    });
  };

  // Handle form submission for both create and edit actions
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent default browser form submission

    // If we are editing an existing list
    if (editingList) {
      // Send an update (PUT) request to the server with the editing list's id
      put(listsRoutes.update.url(editingList.id), {
        onSuccess: () => {
          setOpen(false);        // close the dialog
          reset();               // reset the form fields
          setEditingList(null);  // clear editing state
        },
      });
    } else {
      // Otherwise, we are creating a new list
      post(listsRoutes.store.url(), {
        onSuccess: () => {
          setOpen(false); // close the dialog
          reset();        // reset the form fields
        },
      });
    }
  };

  // Render the page
  return (
    // Wrap content in the AppLayout, passing breadcrumb items to show navigation trail
    <AppLayout breadcrumbs={breadcrumbItems}>
      {/* Set the browser tab title to "Lists" */}
      <Head title="Lists" />

      {/* Show a toast notification if showToast is true */}
      {showToast && (
        // Container for the toast at the top-right of the screen
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg shadow-lg px-4 py-2 ${
            toastType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {/* Show a success icon or an error icon based on toastType */}
          {toastType === "success" ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6" />
          )}
          {/* The text of the toast message */}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main page content container with padding and spacing */}
      <div className="flex flex-col h-full flex-1 gap-4 rounded-xl p-4">
        {/* Header area with page title and the New List button+dialog */}
        <div className="flex items-center justify-between">
          {/* Page title */}
          <h1 className="text-2xl font-bold">Lists</h1>

          {/* Dialog for Create / Edit actions */}
          <Dialog open={open} onOpenChange={setOpen}>
            {/* The trigger button that opens the dialog.
                Using 'asChild' allows the Button to act as the trigger. */}
            <DialogTrigger asChild>
              {/* Button to start creating a new list */}
              <Button onClick={startCreate}>
                {/* Plus icon before the text */}
                <Plus className="mr-2 h-4 w-4" />
                {/* Button label */}
                New List
              </Button>
            </DialogTrigger>

            {/* The content inside the modal dialog */}
            <DialogContent>
              {/* Dialog header area: title and description */}
              <DialogHeader>
                {/* If editingList is set, show "Edit List"; otherwise, "New List" */}
                <DialogTitle>{editingList ? "Edit List" : "New List"}</DialogTitle>
                {/* Describe what the user should do in the dialog */}
                <DialogDescription>
                  {editingList
                    ? "Update the details of your list below."
                    : "Create a new list to organize your tasks."}
                </DialogDescription>
              </DialogHeader>

              {/* The form inside the dialog for name and description */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name input field group */}
                <div className="space-y-2">
                  {/* Label for the name input */}
                  <Label htmlFor="name">Name</Label>
                  {/* Text input bound to data.name, required for submission */}
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)} // update form state on change
                    required
                  />
                  {/* Example validation message from server (uncomment to show)
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )} */}
                </div>

                {/* Description textarea field group */}
                <div className="space-y-2">
                  {/* Label for the description textarea */}
                  <Label htmlFor="description">Description</Label>
                  {/* Textarea bound to data.description, required for submission */}
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData("description", e.target.value)} // update form state
                    required
                  />
                  {/* Example validation message from server (uncomment to show)
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )} */}
                </div>

                {/* Footer area with Submit and Cancel buttons */}
                <DialogFooter>
                  {/* Submit button; disabled while processing request */}
                  <Button type="submit" disabled={processing}>
                    {/* Change text based on whether we are editing or creating */}
                    {editingList ? "Update List" : "Create List"}
                  </Button>
                  {/* Cancel button to close dialog and reset form */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);       // close dialog
                      setEditingList(null); // clear editing state
                      reset();              // reset form fields
                    }}
                  >
                    {/* Button label */}
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid layout for displaying all lists as cards */}
        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Loop over 'lists' and render a card for each list */}
          {lists.map((list) => (
            // Each card must have a unique 'key'; we use list.id
            <Card key={list.id} className="shadow-md">
              {/* Card header with title and description */}
              <CardHeader className="flex flex-col space-y-1">
                {/* Show the list name as the card title */}
                <CardTitle className="text-lg font-semibold">
                  {list.name}
                </CardTitle>
                {/* Show the list description; limit to 3 lines with line-clamp */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {list.description}
                </p>
              </CardHeader>
              {/* Card content area with task count and action buttons */}
              <CardContent className="flex items-center justify-between pt-0">
                {/* Show task count for the list */}
                <span className="text-xs font-medium text-neutral-600">
                  Tasks: {list.tasks_count}
                </span>
                {/* Action buttons (Edit and Delete) */}
                <div className="flex items-center gap-2">
                  {/* Edit button opens dialog with pre-filled form */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(list)} // call handleEdit with current list
                  >
                    {/* Pencil icon for edit */}
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {/* Delete button removes the list */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(list.id)} // call handleDelete with id
                  >
                    {/* Trash icon for delete */}
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* If there are no lists, show an empty state message */}
          {lists.length === 0 && (
            <div className="col-span-full text-center text-sm text-neutral-500">
              No lists found. Create one using the New List button.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}