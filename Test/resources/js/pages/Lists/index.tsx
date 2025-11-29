import { Head, Link, useForm } from "@inertiajs/react";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../../components/ui/textarea";

import { type BreadcrumbItem } from "@/types";
import AppLayout from "@/layouts/app-layout";
import listsRoutes from "../../routes/lists";

interface ListItem {
  id: number;
  name: string;
  description: string;
  tasks_count: number;
}

interface Props {
  lists: ListItem[];
  flash: { success?: string; error?: string };
}

const breadcrumbItems: BreadcrumbItem[] = [{ title: "Lists", href: "/lists" }];

export default function ListsIndex({ lists, flash }: Props) {
  const [open, setOpen] = useState(false);
  const [editingList, setEditingList] = useState<ListItem | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const {
    data,
    setData,
    post,
    put,
    delete: destroy,
    reset,
    processing,
    errors,
  } = useForm({
    name: "",
    description: "",
  });

  // Handle flash messages
  useEffect(() => {
    if (flash.success) {
      setToastMessage(flash.success);
      setToastType("success");
      setShowToast(true);
    } else if (flash.error) {
      setToastMessage(flash.error);
      setToastType("error");
      setShowToast(true);
    }
  }, [flash]);

  // Auto-hide toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const startCreate = () => {
    setEditingList(null);
    reset();
    setOpen(true);
  };

  const handleEdit = (list: ListItem) => {
    setEditingList(list);
    setData({
      name: list.name,
      description: list.description,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    destroy(listsRoutes.destroy.url(id), {
      onSuccess: () => {
        // Optionally handle UI updates
      },
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingList) {
      put(listsRoutes.update.url(editingList.id), {
        onSuccess: () => {
          setOpen(false);
          reset();
          setEditingList(null);
        },
      });
    } else {
      post(listsRoutes.store.url(), {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbItems}>
      <Head title="Lists" />

      {/* Toast notification */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg shadow-lg px-4 py-2 ${
            toastType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toastType === "success" ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col h-full flex-1 gap-4 rounded-xl p-4">
        {/* Header + New Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Lists</h1>

          {/* Dialog for Create / Edit */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New List
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingList ? "Edit List" : "New List"}</DialogTitle>
                <DialogDescription>
                  {editingList
                    ? "Update the details of your list below."
                    : "Create a new list to organize your tasks."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    required
                  />
                  {/* {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )} */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData("description", e.target.value)}
                    required
                  />
                  {/* {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )} */}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={processing}>
                    {editingList ? "Update List" : "Create List"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setEditingList(null);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>



        {/* Lists Grid */}
        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Card key={list.id} className="shadow-md">
              <CardHeader className="flex flex-col space-y-1">
                <CardTitle className="text-lg font-semibold">
                  {list.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {list.description}
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <span className="text-xs font-medium text-neutral-600">
                  Tasks: {list.tasks_count}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(list)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(list.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

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