"use client";

import { useActionState } from "react";
import { Download, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { RuledField } from "@/components/auth/ruled-field";
import { deleteAccountAction, logOutEverywhereAction } from "@/lib/actions/account";
import type { ActionState } from "@/lib/actions/types";

const initial: ActionState = { ok: false, error: "" };

export function DangerZone() {
  const [state, deleteAction, deleting] = useActionState(deleteAccountAction, initial);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div>
          <h3 className="text-base font-semibold">Export everything</h3>
          <p className="text-ink-2 text-sm">Every row Daybook holds for you, as one JSON file.</p>
        </div>
        <a
          href="/api/account/export"
          download
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div>
          <h3 className="text-base font-semibold">Sign out everywhere</h3>
          <p className="text-ink-2 text-sm">
            Ends every session on every device, including this one.
          </p>
        </div>
        <form action={logOutEverywhereAction}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="h-4 w-4" />
            Sign out all
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div>
          <h3 className="text-destructive text-base font-semibold">Close this account</h3>
          <p className="text-ink-2 text-sm">
            Permanent. Your tasks, notes and budgets are deleted and cannot be recovered.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger className={buttonVariants({ variant: "destructive", size: "sm" })}>
            Close account
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes everything, right away. Enter your password to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form action={deleteAction} className="mt-2">
              <RuledField
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
              {!state.ok && state.error ? (
                <p className="text-destructive mt-2 text-sm" role="alert">
                  {state.error}
                </p>
              ) : null}
              <div className="mt-4 flex justify-end gap-2">
                <AlertDialogCancel className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Keep it
                </AlertDialogCancel>
                <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
                  {deleting ? "Closing…" : "Close account for good"}
                </Button>
              </div>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
