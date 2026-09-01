"use client";

import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOutAction } from "@/lib/actions/session";

export function UserMenu({ name, email }: { name: string | null; email: string }) {
  const initials = (name ?? email)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-ring rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
        <Avatar className="border-foreground/20 h-8 w-8 rounded-[2px] border">
          <AvatarFallback className="rounded-[2px] font-[family-name:var(--font-mono)] text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-medium">{name ?? "Your account"}</div>
          <div className="text-muted-foreground text-xs">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem
            variant="destructive"
            className="w-full cursor-pointer"
            render={<button type="submit" />}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
