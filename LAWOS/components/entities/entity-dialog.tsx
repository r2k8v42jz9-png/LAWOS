"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, FieldLabel } from "@/components/ui/field";
import {
  getEntityDef,
  validate,
  type FieldDef,
  type FormValues,
} from "@/lib/obsidian/entities";
import { createEntity, updateEntity, loadEntity, renameEntityFile } from "@/lib/obsidian/actions";

function emptyValues(fields: FieldDef[]): FormValues {
  const v: FormValues = {};
  for (const f of fields) v[f.name] = f.type === "select" ? f.options?.[0]?.value ?? "" : "";
  return v;
}

export function EntityDialog({
  entityKey,
  mode,
  path,
  open,
  onOpenChange,
}: {
  entityKey: string;
  mode: "create" | "edit";
  path?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const entity = getEntityDef(entityKey);
  const router = useRouter();
  const [values, setValues] = React.useState<FormValues>(() => emptyValues(entity?.fields ?? []));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [originalTitle, setOriginalTitle] = React.useState("");
  const [rename, setRename] = React.useState(false);

  // Reset / prefill whenever the dialog opens.
  React.useEffect(() => {
    if (!open || !entity) return;
    setErrors({});
    setFormError(null);
    setRename(false);
    if (mode === "edit" && path) {
      setLoading(true);
      loadEntity(entityKey, path)
        .then((loaded) => {
          const v = loaded ?? emptyValues(entity.fields);
          setValues(v);
          setOriginalTitle((v[entity.titleField] ?? "").trim());
        })
        .finally(() => setLoading(false));
    } else {
      setValues(emptyValues(entity.fields));
      setOriginalTitle("");
    }
  }, [open, mode, path, entityKey, entity]);

  if (!entity) return null;

  // In edit mode, offer an optional safe rename once the title actually changes.
  const newTitle = (values[entity.titleField] ?? "").trim();
  const titleChanged = mode === "edit" && newTitle.length > 0 && newTitle !== originalTitle;

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  async function submit() {
    const v = validate(entity!, values);
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res =
        mode === "edit" && path
          ? await updateEntity(entityKey, path, values)
          : await createEntity(entityKey, values);
      if (res.ok) {
        // Optional safe rename of the underlying file (keeps backlinks intact).
        if (mode === "edit" && path && rename && titleChanged) {
          const r = await renameEntityFile(entityKey, path, newTitle);
          if (!r.ok) {
            setFormError(r.message ?? "Saved, but the file couldn't be renamed.");
            setSubmitting(false);
            router.refresh();
            return;
          }
        }
        onOpenChange(false);
        router.refresh();
      } else if (res.errors) {
        setErrors(res.errors);
      } else {
        setFormError(res.message ?? "Something went wrong.");
      }
    } catch {
      setFormError("Couldn't reach the vault. Is Obsidian running?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined} onOpenAutoFocus={(e) => e.preventDefault()}>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-hairline glass shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
                  <Dialog.Title className="text-sm font-semibold text-foreground">
                    {mode === "edit" ? "Edit" : "New"} {entity.label}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Close">
                      <X className="size-4" />
                    </Button>
                  </Dialog.Close>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                >
                  <div className="max-h-[60vh] overflow-y-auto p-5">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Loading…
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {entity.fields.map((field) => (
                          <FieldRow
                            key={field.name}
                            field={field}
                            value={values[field.name] ?? ""}
                            error={errors[field.name]}
                            onChange={(val) => set(field.name, val)}
                          />
                        ))}
                      </div>
                    )}

                    {!loading && titleChanged && (
                      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-hairline bg-surface-2/40 px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={rename}
                          onChange={(e) => setRename(e.target.checked)}
                          className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                        />
                        <span className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Rename the file to match</span> — the
                          note is currently <span className="font-mono text-foreground">{originalTitle}.md</span>.
                          Leave unchecked to keep the filename. Renaming updates any{" "}
                          <code className="rounded bg-surface-2 px-1 text-[11px]">[[wiki-links]]</code> so nothing breaks.
                        </span>
                      </label>
                    )}

                    {formError && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                        <AlertCircle className="size-4 shrink-0" />
                        {formError}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-4">
                    <Dialog.Close asChild>
                      <Button type="button" variant="ghost" size="sm">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button type="submit" size="sm" disabled={submitting || loading}>
                      {submitting && <Loader2 className="size-4 animate-spin" />}
                      {mode === "edit" ? "Save changes" : `Create ${entity.label.toLowerCase()}`}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function FieldRow({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = `f-${field.name}`;
  return (
    <div className={cn(field.full || field.type === "textarea" ? "col-span-2" : "col-span-2 sm:col-span-1")}>
      <FieldLabel htmlFor={id} required={field.required}>
        {field.label}
      </FieldLabel>
      {field.type === "textarea" ? (
        <Textarea id={id} value={value} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "select" ? (
        <div className="relative">
          <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      ) : (
        <Input
          id={id}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          inputMode={field.type === "number" ? "decimal" : undefined}
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.help && !error && <p className="mt-1 text-[11px] text-muted-foreground/70">{field.help}</p>}
      {error && <p className="mt-1 text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}
