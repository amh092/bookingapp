"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import { saveMenuItemAction, type MenuActionResult } from "@/actions/menu";
import { DishImage } from "@/components/menu/DishImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminMenuCategory, MenuItemWithCategory } from "@/types/menu";

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

interface DishFormDialogProps {
  categories: AdminMenuCategory[];
  /** Present when editing; absent for the "Add dish" flow. */
  item?: MenuItemWithCategory;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

/** Create/edit dish form in an accessible dialog, submitted via server action. */
export function DishFormDialog({ categories, item }: DishFormDialogProps) {
  const router = useRouter();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<MenuActionResult | null>(null);
  const [imagePreview, setImagePreview] = useState(item?.imageUrl ?? "");
  const [isPending, startTransition] = useTransition();

  const fieldErrors = result?.fieldErrors ?? {};
  const id = (name: string) => `${formId}-${name}`;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      // The popup remounts per open, so state must reset alongside it.
      setResult(null);
      setImagePreview(item?.imageUrl ?? "");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const outcome = await saveMenuItemAction(item?.id ?? null, formData);
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
          item ? (
            <Button size="sm" variant="ghost" aria-label={`Edit ${item.name}`} />
          ) : (
            <Button size="sm" />
          )
        }
      >
        {item ? "Edit" : "Add dish"}
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? `Edit ${item.name}` : "Add dish"}</DialogTitle>
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
              defaultValue={item?.name ?? ""}
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
              defaultValue={item?.nameAr ?? ""}
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
              defaultValue={item?.description ?? ""}
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
              defaultValue={item?.descriptionAr ?? ""}
            />
            <FieldError
              id={id("descriptionAr-error")}
              message={fieldErrors.descriptionAr}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={id("price")}>Price (SAR)</Label>
            <Input
              id={id("price")}
              name="price"
              inputMode="decimal"
              required
              placeholder="28 or 28.50"
              defaultValue={item?.price ?? ""}
              aria-invalid={fieldErrors.price ? true : undefined}
              aria-describedby={fieldErrors.price ? id("price-error") : undefined}
            />
            <FieldError id={id("price-error")} message={fieldErrors.price} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={id("preparationMinutes")}>Prep minutes</Label>
            <Input
              id={id("preparationMinutes")}
              name="preparationMinutes"
              type="number"
              min={1}
              max={240}
              defaultValue={item?.preparationMinutes ?? ""}
              aria-invalid={fieldErrors.preparationMinutes ? true : undefined}
            />
            <FieldError
              id={id("preparationMinutes-error")}
              message={fieldErrors.preparationMinutes}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={id("categoryId")}>Category</Label>
            <select
              id={id("categoryId")}
              name="categoryId"
              required
              defaultValue={item?.categoryId ?? categories[0]?.id ?? ""}
              className={SELECT_CLASS}
              aria-invalid={fieldErrors.categoryId ? true : undefined}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isActive ? "" : " (hidden)"}
                </option>
              ))}
            </select>
            <FieldError
              id={id("categoryId-error")}
              message={fieldErrors.categoryId}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={id("imageUrl")}>Image URL</Label>
            <Input
              id={id("imageUrl")}
              name="imageUrl"
              type="url"
              placeholder="https://…"
              defaultValue={item?.imageUrl ?? ""}
              onChange={(event) => setImagePreview(event.target.value.trim())}
              aria-invalid={fieldErrors.imageUrl ? true : undefined}
            />
            <FieldError id={id("imageUrl-error")} message={fieldErrors.imageUrl} />
          </div>

          <div className="relative grid h-24 place-items-center overflow-hidden rounded-lg border border-border bg-gradient-to-br from-secondary to-elevated sm:col-span-2">
            <DishImage
              src={imagePreview || null}
              alt="Dish photo preview"
              sizes="24rem"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={id("dietaryTags")}>Dietary tags</Label>
            <Input
              id={id("dietaryTags")}
              name="dietaryTags"
              placeholder="Vegetarian, Vegan"
              defaultValue={item?.dietaryTags.join(", ") ?? ""}
              aria-describedby={id("dietaryTags-hint")}
              aria-invalid={fieldErrors.dietaryTags ? true : undefined}
            />
            <p
              id={id("dietaryTags-hint")}
              className="text-xs text-muted-foreground"
            >
              Comma separated.
            </p>
            <FieldError
              id={id("dietaryTags-error")}
              message={fieldErrors.dietaryTags}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={id("allergens")}>Allergens</Label>
            <Input
              id={id("allergens")}
              name="allergens"
              placeholder="Nuts, Shellfish"
              defaultValue={item?.allergens.join(", ") ?? ""}
              aria-describedby={id("allergens-hint")}
              aria-invalid={fieldErrors.allergens ? true : undefined}
            />
            <p
              id={id("allergens-hint")}
              className="text-xs text-muted-foreground"
            >
              Comma separated.
            </p>
            <FieldError
              id={id("allergens-error")}
              message={fieldErrors.allergens}
            />
          </div>

          <div className="flex items-center justify-between gap-2 rounded-lg border border-input px-3 py-2">
            <Label htmlFor={id("isAvailable")} className="cursor-pointer">
              Available
            </Label>
            <Switch
              id={id("isAvailable")}
              name="isAvailable"
              defaultChecked={item?.isAvailable ?? true}
            />
          </div>

          <div className="flex items-center justify-between gap-2 rounded-lg border border-input px-3 py-2">
            <Label htmlFor={id("isFeatured")} className="cursor-pointer">
              Featured
            </Label>
            <Switch
              id={id("isFeatured")}
              name="isFeatured"
              defaultChecked={item?.isFeatured ?? false}
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
              {isPending ? "Saving…" : "Save dish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
