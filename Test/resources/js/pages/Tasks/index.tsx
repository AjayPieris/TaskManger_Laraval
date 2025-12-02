import { Head, router, useForm } from "@inertiajs/react";
import taskRoutes from "@/routes/tasks";
import { useEffect, useState } from "react";

import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  List,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------
   Types
-------------------------------------------------------------------*/

// Task interface
interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  list_id: number;
  list: {
    id: number;
    name: string;
  };
}

// List interface
interface List {
  id: number;
  name: string;
}

// Generic paginated response
interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// Component Props
interface Props {
  tasks: Paginated<Task>;
  lists: List[];
  filters: {
    search: string;
    filter: string;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

// Using Wayfinder for routes; Ziggy's route() is not used here.

export default function TasksIndex({ tasks, lists, filters, flash }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const allowedFilters = ["all", "completed", "pending"] as const;
  const initialFilter =
    allowedFilters.includes(filters.filter as any)
      ? (filters.filter as (typeof allowedFilters)[number])
      : "all";
  const [completionFilter, setCompletionFilter] = useState<"all" | "completed" | "pending">(initialFilter);

  useEffect(() => {
    if (flash?.success) {
      setToastMessage(flash.success);
      setToastType("success");
      setShowToast(true);
    } else if (flash?.error) {
      setToastMessage(flash.error);
      setToastType("error");
      setShowToast(true);
    }
  }, [flash]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const { data, setData, post, put, processing, reset, delete: destroy } = useForm({
    title: "",
    description: "",
    due_date: "",
    list_id: "",
    is_completed: false as boolean,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingTask) {
      put(taskRoutes.update(editingTask.id).url, {
        onSuccess: () => {
          setIsOpen(false);
          reset();
          setEditingTask(null);
        },
      });
    } else {
      post(taskRoutes.store().url, {
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setData({
      title: task.title,
      description: task.description || "",
      due_date: task.due_date || "",
      list_id: task.list_id.toString(),
      is_completed: task.is_completed,
    });
    setIsOpen(true);
  };

  const handleDelete = (taskId: number) => {
    destroy(taskRoutes.destroy(taskId).url);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.get(
      taskRoutes.index().url,
      {
        search: searchTerm,
        filter: completionFilter,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handleFilterChange = (value: "all" | "completed" | "pending") => {
    setCompletionFilter(value);
    router.get(
      taskRoutes.index().url,
      {
        search: searchTerm,
        filter: value,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handlePageChange = (page: number) => {
    router.get(
      taskRoutes.index().url,
      {
        page,
        search: searchTerm,
        filter: completionFilter,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  return (
    <AppLayout>
      <Head title="Tasks" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 bg-linear-to-br from-background to-muted/20">
        {showToast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center rounded-lg p-4 shadow-lg ${
              toastType === "success" ? "bg-green-500" : "bg-red-500"
            } text-white animate-in fade-in slide-in-from-top-5`}
          >
            {toastType === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span className="ml-2">{toastMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage your tasks effectively</p>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingTask(null);
              reset();
            }
          }}>
            <DialogTrigger>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-medium">
                  {editingTask ? "Edit Task" : "Create New Task"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    required
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="list_id">List</Label>
                  <Select onValueChange={(value) => setData("list_id", value)} value={data.list_id}>
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select a list" />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((list) => (
                        <SelectItem key={list.id} value={list.id.toString()}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={data.due_date}
                    onChange={(e) => setData("due_date", e.target.value)}
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="is_completed"
                    type="checkbox"
                    checked={data.is_completed}
                    onChange={(e) => setData("is_completed", e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <Label htmlFor="is_completed" className="select-none">
                    Completed
                  </Label>
                </div>

                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white w-full">
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-primary w-full"
            />
          </form>

          <Select onValueChange={handleFilterChange} value={completionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Title
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Description
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    List
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Due Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Status
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {tasks.data.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="px-4 py-3 align-middle">{task.title}</td>
                    <td className="px-4 py-3 align-middle">{task.description || "No description"}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4 text-muted-foreground" />
                        <span>{task.list.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {task.due_date ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No due date</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {task.is_completed ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <span className="text-yellow-500">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right align-middle">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-md border border-muted/50 hover:bg-muted/50"
                          onClick={() => handleEdit(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-md border border-muted/50 hover:bg-muted/50"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {tasks.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground">
                      No tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {tasks.from ?? 0} to {tasks.to ?? 0} of {tasks.total} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 rounded-md border border-muted/50 hover:bg-muted/50"
              onClick={() => handlePageChange(Math.max(1, tasks.current_page - 1))}
              disabled={tasks.current_page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: tasks.last_page }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === tasks.current_page ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(Math.min(tasks.last_page, tasks.current_page + 1))}
              disabled={tasks.current_page === tasks.last_page}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}