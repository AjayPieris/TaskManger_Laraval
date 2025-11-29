import {Head} from "@inertiajs/react";
import {Button} from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "@inertiajs/react";
import appLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";    
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";

interface Lists{
    id: number;
    title: string;
    description: string;
    tasks_count: number;
}

interface Props{
    lists: Lists[];
    flash: { success?: string; error?: string; };
}

const breadcrumbItems: BreadcrumbItem[] = [
    {
        title: 'Lists',
        href: '/lists',
    },
];

export default function ListsIndex({lists, flash}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [ editingList, setEditingList] = useState<Lists | null>(null);
    const [ showToast, setShowToast ] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (flash.success) {
            setToastMessage(flash.success);
            setToastType('success');
            setShowToast(true);
        } else if (flash.error) {
            setToastMessage(flash.error);
            setToastType('error');
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
        title: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingList) {
            put(route('list.update', editingList.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingList(null);
                }   
            });
        }
        else {
            post(route('list.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }   
            });
        }
    };

    const handleEdit = (list: Lists) => {
        setEditingList(list);
        setData({
            title: list.title,
            description: list.description,
        });
        setIsOpen(true);
    };

    const handleDelete = (listId: number) => {
        destroy(route('list.destroy', listId));
    };

    return (
       <AppLayout breadcrumbs={breadcrumbs} >
          <Head title="Lists" />
            <div className="flex h-full flex-1 gap-4 rounded-xl p-4">
                {showToast && (
                    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md text-white ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        <div className="flex items-center">
                            {toastType === 'success' ? <CheckCircle2 className="mr-2" /> : <XCircle className="mr-2" />}
                            <span>{toastMessage}</span>
                        </div>


