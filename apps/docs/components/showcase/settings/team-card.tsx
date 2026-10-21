"use client";

import * as React from "react";
import { MoreHorizontalIcon, UserMinusIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/registry/proto-lab/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/registry/proto-lab/ui/avatar";
import { Badge } from "@/registry/proto-lab/ui/badge";
import { Button } from "@/registry/proto-lab/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/proto-lab/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/proto-lab/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/proto-lab/ui/table";

const roles = ["Owner", "Admin", "Editor", "Viewer"] as const;
type Role = (typeof roles)[number];

type Member = { id: string; name: string; email: string; role: Role };

const seed: Member[] = [
  { id: "mo", name: "Maya Okafor", email: "maya.okafor", role: "Owner" },
  { id: "dr", name: "Daniel Reyes", email: "daniel.reyes", role: "Admin" },
  { id: "pk", name: "Priya Kapoor", email: "priya.kapoor", role: "Editor" },
  {
    id: "jw",
    name: "Jordan Whitfield",
    email: "jordan.whitfield",
    role: "Editor",
  },
  { id: "sl", name: "Sam Lindqvist", email: "sam.lindqvist", role: "Viewer" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

export function TeamCard() {
  const [members, setMembers] = React.useState<Member[]>(seed);
  const [pending, setPending] = React.useState<Member | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [lastRemoved, setLastRemoved] = React.useState<{
    member: Member;
    index: number;
  } | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  function changeRole(id: string, role: Role) {
    const m = members.find((x) => x.id === id);
    if (!m || m.role === role) return;
    setMembers((list) => list.map((x) => (x.id === id ? { ...x, role } : x)));
    setLastRemoved(null);
    setNotice(`${m.name} is now ${role === "Admin" ? "an" : "a"} ${role}.`);
  }

  function confirmRemove() {
    if (!pending) return;
    const index = members.findIndex((m) => m.id === pending.id);
    setMembers((list) => list.filter((m) => m.id !== pending.id));
    setLastRemoved({ member: pending, index });
    setNotice(`${pending.name} was removed.`);
    setDialogOpen(false);
  }

  function undo() {
    if (!lastRemoved) return;
    setMembers((list) => {
      const copy = [...list];
      copy.splice(lastRemoved.index, 0, lastRemoved.member);
      return copy;
    });
    setNotice(`${lastRemoved.member.name} was restored.`);
    setLastRemoved(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team roles</CardTitle>
        <CardDescription>
          Who can work in the Riverbank CX workspace.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">{members.length} members</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {members.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No one is on this workspace yet. Invite people to start
            collaborating.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => {
                const isOwner = m.role === "Owner";
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarFallback>{initials(m.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">{m.name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {m.email}@captech
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isOwner
                            ? "default"
                            : m.role === "Viewer"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${m.name}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>{m.name}</DropdownMenuLabel>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  Change role
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuRadioGroup
                                    value={m.role}
                                    onValueChange={(v) =>
                                      changeRole(m.id, v as Role)
                                    }
                                  >
                                    {roles
                                      .filter((r) => r !== "Owner")
                                      .map((r) => (
                                        <DropdownMenuRadioItem
                                          key={r}
                                          value={r}
                                        >
                                          {r}
                                        </DropdownMenuRadioItem>
                                      ))}
                                  </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setPending(m);
                                setDialogOpen(true);
                              }}
                            >
                              <UserMinusIcon />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <div
          className="flex min-h-7 items-center justify-between gap-2 text-xs text-muted-foreground"
          aria-live="polite"
        >
          <span>{notice ?? "Owners can only be changed by IT."}</span>
          {lastRemoved && (
            <Button variant="link" size="sm" onClick={undo}>
              Undo
            </Button>
          )}
        </div>
      </CardContent>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive-subtle text-destructive">
              <UserMinusIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove {pending?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They lose access to Riverbank CX right away. Their past comments
              stay.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmRemove}>
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
