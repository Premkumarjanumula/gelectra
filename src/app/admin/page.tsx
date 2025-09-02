"use client";

import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Trash2, Copy, Plus, Users, ShieldCheck, Search } from "lucide-react";

import { auth } from "@/lib/firebase"; // ✅ get current user/token

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type User = {
  uid: string;
  email: string;
  role: "EXECUTIVE_BOARD_MEMBER" | "CLUB_MEMBER";
  createdAt: string;
  disabled?: boolean;
};

export default function AdminPage() {
  // modal + form
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EXECUTIVE_BOARD_MEMBER" | "CLUB_MEMBER">("CLUB_MEMBER");
  const [loadingCreate, setLoadingCreate] = useState(false);

  // delete confirm
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // search + filter + sort
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "EXECUTIVE_BOARD_MEMBER" | "CLUB_MEMBER">("ALL");
  const [sortBy, setSortBy] = useState<"createdAt" | "email">("createdAt");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUsers() {
    try {
      setLoadingUsers(true);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error("You must be logged in as admin");
        setLoadingUsers(false);
        return;
      }
      const idToken = await currentUser.getIdToken();

      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${idToken}`, // ✅ fix: send token
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load users");
      }
      setUsers(data.users || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Error loading users");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleAddUser() {
    // ⚠️ keep the working create+email flow intact
    try {
      setLoadingCreate(true);
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("❌ " + (data.error || "Something went wrong"));
        return;
      }
      toast.success("✅ User created & invite email sent!");
      setEmail("");
      setRole("CLUB_MEMBER");
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while creating user.");
    } finally {
      setLoadingCreate(false);
    }
  }

  function confirmDelete(u: User) {
    setDeleteUser(u);
  }

  async function handleDelete() {
    if (!deleteUser?.uid) {
      console.error("Delete attempted without UID:", deleteUser);
      toast.error("Invalid user selected for deletion");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error("You must be logged in as admin");
        return;
      }

      // 🔑 Ensure we send an admin’s token
      const idToken = await currentUser.getIdToken();

      const res = await fetch(`/api/users/${deleteUser.uid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete user");

      // ✅ Remove from UI immediately
      toast.success(`Deleted ${deleteUser.email}`);
      setUsers((prev) => prev.filter((u) => u.uid !== deleteUser.uid));
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Error deleting user");
    } finally {
      setDeleteUser(null);
    }
  }


  const filteredUsers = useMemo(() => {
    const list = users.filter(
      (u) =>
        (filterRole === "ALL" || u.role === filterRole) &&
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    return list.sort((a, b) =>
      sortBy === "email"
        ? a.email.localeCompare(b.email)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [users, search, filterRole, sortBy]);

  return (
    <div className="container mx-auto py-16 sm:py-24">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="font-headline text-5xl font-bold tracking-tight">Admin Panel</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage members of G-Electra. Create invites, filter, and remove users.
        </p>
      </div>

      {/* Controls Card */}
      <Card className="mb-8 border-primary/20 shadow-lg shadow-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Users className="text-primary" />
            Users
          </CardTitle>
          <CardDescription>Search, filter and manage registered users.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="border w-full rounded-md bg-background p-2"
            >
              <option value="ALL">All Roles</option>
              <option value="EXECUTIVE_BOARD_MEMBER">Executive Board</option>
              <option value="CLUB_MEMBER">Club Member</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border w-full rounded-md bg-background p-2"
            >
              <option value="createdAt">Sort by Created Date</option>
              <option value="email">Sort by Email</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Only authorized admins can fetch or delete users.
            </span>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardFooter>
      </Card>

      {/* Users Table Card */}
      <Card className="border-primary/20 shadow-lg shadow-primary/10">
        <CardContent className="p-0">
          {loadingUsers ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">UID</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Created</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="border-t border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === "EXECUTIVE_BOARD_MEMBER" ? "default" : "secondary"}>
                          {u.role.replaceAll("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[160px]">{u.uid}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigator.clipboard.writeText(u.uid).then(() => toast.success("UID copied"))
                            }
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.disabled ? "destructive" : "default"}>
                          {u.disabled ? "Disabled" : "Active"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            confirmDelete({
                              uid: u.uid,
                              email: u.email,
                              role: u.role,
                              createdAt: u.createdAt,
                              disabled: u.disabled,
                            })
                          }
                          className="hover:opacity-90"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Create New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="border w-full rounded-md bg-background p-2"
            >
              <option value="EXECUTIVE_BOARD_MEMBER">Executive Board</option>
              <option value="CLUB_MEMBER">Club Member</option>
            </select>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={loadingCreate}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={loadingCreate}>
              {loadingCreate ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-destructive">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deleteUser?.email}
            </span>
            ?
          </p>

          {/* Show UID for clarity */}
          {deleteUser?.uid && (
            <p className="mt-2 text-xs text-muted-foreground">
              UID: <span className="font-mono">{deleteUser.uid}</span>
            </p>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!deleteUser?.uid}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
