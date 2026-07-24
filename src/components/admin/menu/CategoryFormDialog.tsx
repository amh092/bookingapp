"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import { saveMenuCategoryAction, type MenuActionResult } from "@/actions/menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminMenuCategory } from "@/types/menu";

interface CategoryFormDialogProps {
  /** Present when editing; absent for the "New category" flow. */
  category?: AdminMenuCategory;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

/** Create/edit category form — name, Arabic name, descriptions, position, active. */
export function CategoryFormDialog({ category }: CategoryFormDialogProps) {
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<MenuActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const fieldErrors = result?.fieldErrors ?? {};
  const id = (name: string) => `${formId}-${name}`;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setResult(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const outcome = await saveMenuCategoryAction(
        category?.id ?? null,
        formData
      );
      if (!outcome.success) {
        setResult(outcome);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          category ? (
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Edit ${category.name}`}
            />
          ) : (
            <Button size="sm" variant="outline" />
          )
        }
      >
        {category ? "Edit" : "New category"}
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? `Edit ${category.name}` : "New category"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor={id("name")}>Name</Label>
            <Input
              id={id("name")}
              name="name"
              required
              defaultValue={category?.name ?? ""}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? id("name-error") : undefined}
            />
            <FieldError id={id("name-error")} message={fieldErrors.name} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={id("nameAr")}>Arabic name</Label>
            <Input
              id={id("nameAr")}
              name="nameAr"
              dir="rtl"
              defaultValue={category?.nameAr ?? ""}
              aria-invalid={fieldErrors.nameAr ? true : undefined}
            />
            <FieldError id={id("nameAr-error")} message={fieldErrors.nameAr} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={id("description")}>Description</Label>
            <Textarea
              id={id("description")}
              name="description"
              rows={2}
              defaultValue={category?.description ?? ""}
            />
            <FieldError
              id={id("description-error")}
              message={fieldErrors.description}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={id("descriptionAr")}>Arabic description</Label>
            <Textarea
              id={id("descriptionAr")}
              name="descriptionAr"
              dir="rtl"
              rows={2}
              defaultValue={category?.descriptionAr ?? ""}
            />
            <FieldError
              id={id("descriptionAr-error")}
              message={fieldErrors.descriptionAr}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={id("position")}>Position</Label>
            <Input
              id={id("position")}
              name="position"
              type="number"
              min={0}
              max={1000}
              defaultValue={category?.position ?? 0}
              aria-describedby={id("position-hint")}
              aria-invalid={fieldErrors.position ? true : undefined}
            />
            <p id={id("position-hint")} className="text-xs text-muted-foreground">
              Lower numbers appear first.
            </p>
            <FieldError id={id("position-error")} message={fieldErrors.position} />
          </div>

          <div className="flex h-fit items-center justify-between gap-2 self-end rounded-lg border border-input px-3 py-2">
            <Label htmlFor={id("isActive")} className="cursor-pointer">
              Active
            </Label>
            <Switch
              id={id("isActive")}
              name="isActive"
              defaultChecked={category?.isActive ?? true}
            />
          </div>

          {result?.error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {result.error}
            </p>
          )}

          <DialogFooter className="sm:col-span-2">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
