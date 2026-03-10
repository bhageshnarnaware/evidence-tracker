import { useState } from 'react';
import { useDataStore } from '@/contexts/DataStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';

const roleBadge: Record<string, string> = {
  admin: 'status-transit',
  investigator: 'status-analysis',
  forensic_analyst: 'status-sealed',
  evidence_custodian: 'status-returned',
};

const roleLabel: Record<string, string> = {
  admin: 'Admin',
  investigator: 'Investigator',
  forensic_analyst: 'Forensic Analyst',
  evidence_custodian: 'Evidence Custodian',
};

const UserManagementPage = () => {
  const { users, addUser, updateUser, deleteUser } = useDataStore();
  const { user: currentUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [role, setRole] = useState<User['role']>('investigator');
  const [editRole, setEditRole] = useState<User['role']>('investigator');

  const isAdmin = currentUser?.role === 'admin';

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newUser: User = {
      id: `u${Date.now()}`,
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      role,
      department: fd.get('department') as string,
      created_at: new Date().toISOString().split('T')[0],
    };
    addUser(newUser);
    setDialogOpen(false);
    setRole('investigator');
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    const fd = new FormData(e.currentTarget);
    updateUser(editUser.id, {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      role: editRole,
      department: fd.get('department') as string,
    });
    setEditUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage system users and roles</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add User</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><Label>Full Name</Label><Input name="name" required className="mt-1" /></div>
                <div><Label>Email</Label><Input name="email" type="email" required className="mt-1" /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as User['role'])}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabel).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Department</Label><Input name="department" required className="mt-1" /></div>
                <Button type="submit" className="w-full">Add User</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => (
          <div key={u.id} className="card-forensic flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">
                {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleBadge[u.role]}`}>
                  {roleLabel[u.role]}
                </span>
                <span className="text-[10px] text-muted-foreground">{u.department}</span>
              </div>
            </div>
            {isAdmin && u.id !== currentUser?.id && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { setEditUser(u); setEditRole(u.role); }} className="text-muted-foreground hover:text-primary transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteUser(u.id)} className="text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {editUser && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div><Label>Full Name</Label><Input name="name" defaultValue={editUser.name} required className="mt-1" /></div>
              <div><Label>Email</Label><Input name="email" type="email" defaultValue={editUser.email} required className="mt-1" /></div>
              <div>
                <Label>Role</Label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as User['role'])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabel).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Department</Label><Input name="department" defaultValue={editUser.department} required className="mt-1" /></div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
