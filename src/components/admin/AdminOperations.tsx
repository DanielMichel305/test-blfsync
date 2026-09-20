import React, { useState } from 'react';
import { Archive, Pencil, Play, RefreshCw, Send, Trash2 } from 'lucide-react';
import type { components } from '../../api/generated';
import { ApiError } from '../../api/client';
import { getApiErrorMessage } from '../../api/errors';
import { type AuditLogListParams, type BadgeListParams, type ManagedNotificationListParams, useAuditLogs, useBadgeDefinitions, useCreateAdminNotification, useCreateBadge, useCreateInvitation, useDeleteBadge, useInvitations, useManagedNotifications, useResendInvitation, useRetireBadge, useRevokeInvitation, useUpdateBadge } from '../../api/hooks';
import { AdminListControls, AdminListState, AdminPagination, FilterField, useAdminListState } from './AdminList';
import { BadgeForm } from './BadgeForm';
import { badgeToForm, newBadgeForm } from './badgeRules';
import { ConfirmDialog } from './ConfirmDialog';

type S = components['schemas']; type Badge = S['Badge']; type BadgeInput = S['CreateBadgeRequest'];

export function AdminInvitations() {
  const { query, update } = useAdminListState('invitations', { page: 1, limit: 20, search: '', status: '', role: '', deliveryStatus: '', sortBy: 'createdAt', sortOrder: 'DESC' }); const params = Object.fromEntries(Object.entries(query).map(([key, value]) => [key, value === '' ? undefined : value])); const list = useInvitations(params);
  const create = useCreateInvitation(); const resend = useResendInvitation(); const revoke = useRevokeInvitation(); const [form, setForm] = useState({ email: '', firstName: '', lastName: '', role: 'friend' as 'admin' | 'family' | 'friend' }); const [error, setError] = useState(''); const [revokeId, setRevokeId] = useState<string | null>(null);
  const run = async (operation: () => Promise<unknown>, reset = false) => { setError(''); try { await operation(); setRevokeId(null); if (reset) setForm({ email: '', firstName: '', lastName: '', role: 'friend' }); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Invitation action failed.'); } };
  return <div className="space-y-4"><h2 className="text-2xl font-serif">Invitations</h2><form onSubmit={event => { event.preventDefault(); run(() => create.mutateAsync(form), true); }} className="grid gap-3 rounded-2xl border bg-editorial-card p-4 md:grid-cols-5"><input required type="email" placeholder="Email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} className="rounded-xl border bg-transparent p-2" /><input required placeholder="First name" value={form.firstName} onChange={e => setForm(v => ({ ...v, firstName: e.target.value }))} className="rounded-xl border bg-transparent p-2" /><input required placeholder="Last name" value={form.lastName} onChange={e => setForm(v => ({ ...v, lastName: e.target.value }))} className="rounded-xl border bg-transparent p-2" /><select value={form.role} onChange={e => setForm(v => ({ ...v, role: e.target.value as typeof form.role }))} className="rounded-xl border bg-editorial-card p-2"><option value="friend">Friend</option><option value="family">Family</option><option value="admin">Admin</option></select><button disabled={create.isPending} className="rounded-full bg-editorial-charcoal text-xs font-bold text-editorial-cream">Send invite</button></form>
    <AdminListControls query={query} onChange={update}>{([['Status', 'status', ['', 'pending', 'accepted', 'expired', 'revoked']], ['Role', 'role', ['', 'admin', 'family', 'friend']], ['Delivery', 'deliveryStatus', ['', 'pending', 'sent', 'failed']], ['Sort by', 'sortBy', ['createdAt', 'updatedAt', 'email', 'status', 'expiresAt']], ['Order', 'sortOrder', ['DESC', 'ASC']]] as const).map(([label, key, values]) => <FilterField key={key} label={label}><select value={query[key]} onChange={e => update({ [key]: e.target.value })}>{values.map(value => <option value={value} key={value}>{value || 'All'}</option>)}</select></FilterField>)}</AdminListControls>{error && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600">{error}</p>}
    <AdminListState loading={list.isLoading} error={list.error} empty={!list.data?.invitations.length}><div className="space-y-3">{list.data?.invitations.map(item => <article key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-editorial-card p-4"><div className="min-w-0 flex-1"><p className="text-sm font-bold">{item.invitedFirstName} {item.invitedLastName}</p><p className="text-[10px] text-editorial-charcoal/50">{item.email} · {item.role} · {item.status} · delivery {item.deliveryStatus} · expires {new Date(item.expiresAt).toLocaleString()}</p></div><button onClick={() => run(() => resend.mutateAsync({ id: item.id }))} title="Resend"><RefreshCw className="h-4 w-4" /></button>{item.status === 'pending' && <button onClick={() => setRevokeId(item.id)} title="Revoke"><Trash2 className="h-4 w-4 text-rose-600" /></button>}</article>)}</div></AdminListState>{list.data && <AdminPagination page={list.data.page} limit={list.data.limit} total={list.data.total} totalPages={list.data.totalPages} onChange={update} />}<ConfirmDialog open={!!revokeId} title="Revoke invitation?" description="The current invitation link will stop working." confirmLabel="Revoke" destructive busy={revoke.isPending} onCancel={() => setRevokeId(null)} onConfirm={() => revokeId && run(() => revoke.mutateAsync(revokeId))} />
  </div>;
}

type BadgeAction = 'save' | 'activate' | 'retire' | 'delete';

function badgeActionError(cause: unknown, action: BadgeAction) {
  if (!(cause instanceof ApiError)) return getApiErrorMessage(cause, 'Badge action failed.');
  const detail = cause.message && cause.message !== cause.code ? ` ${cause.message}` : '';
  if (cause.status === 400) return `The badge rule is invalid. Review the selected trigger and all rule values.${detail}`;
  if (cause.status === 404) return `The badge or selected ministry track could not be found.${detail}`;
  if (cause.status === 409 && action === 'delete') return `This badge cannot be deleted while it is active or has user awards.${detail}`;
  if (cause.status === 409) return `The badge code is already in use, or its lifecycle no longer permits this change.${detail}`;
  return getApiErrorMessage(cause, 'Badge action failed.');
}

export function badgeLifecycle(badge: Badge): 'Draft' | 'Active' | 'Retired' {
  if (badge.isActive) return 'Active';
  return badge.definitionLockedAt ? 'Retired' : 'Draft';
}

export function AdminBadges() {
  const { query, update } = useAdminListState('badges', { page: 1, limit: 20, search: '', isActive: '', sortBy: 'createdAt', sortOrder: 'DESC' });
  const list = useBadgeDefinitions({ ...query, isActive: query.isActive === '' ? undefined : query.isActive === 'true' } as BadgeListParams);
  const create = useCreateBadge();
  const save = useUpdateBadge();
  const retire = useRetireBadge();
  const remove = useDeleteBadge();
  const [editing, setEditing] = useState<Badge | 'new' | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: 'activate' | 'retire' | 'delete' } | null>(null);
  const [error, setError] = useState('');
  const run = async (action: BadgeAction, operation: () => Promise<unknown>) => {
    setError('');
    try {
      await operation();
      setEditing(null);
      setConfirm(null);
    } catch (cause) {
      setError(badgeActionError(cause, action));
    }
  };
  const initial = editing === 'new' ? newBadgeForm() : editing ? badgeToForm(editing) : null;
  const locked = editing !== null && editing !== 'new' && !!editing.definitionLockedAt;
  const submit = async (input: BadgeInput) => {
    if (editing === 'new') return run('save', () => create.mutateAsync(input));
    if (!editing) return;
    const updateInput: S['UpdateBadgeRequest'] = locked
      ? { name: input.name, description: input.description, order: input.order }
      : { code: input.code, name: input.name, description: input.description, order: input.order, triggerKey: input.triggerKey, requirementConfig: input.requirementConfig };
    return run('save', () => save.mutateAsync({ id: editing.id, input: updateInput }));
  };
  const confirmTitle = confirm?.action === 'activate' ? 'Activate badge?' : confirm?.action === 'retire' ? 'Retire badge?' : 'Delete badge?';
  const confirmDescription = confirm?.action === 'activate'
    ? 'Activation makes this badge eligible for awards and permanently locks its code, trigger, and rule settings.'
    : confirm?.action === 'retire'
      ? 'Existing awards remain, but this definition becomes inactive and its rule stays locked.'
      : 'Deletion succeeds only while the badge is inactive and has no user awards.';
  const confirmBusy = save.isPending || retire.isPending || remove.isPending;
  return <div className="space-y-4">
    <div className="flex justify-between"><h2 className="text-2xl font-serif">Badge definitions</h2><button type="button" onClick={() => setEditing('new')} className="rounded-full bg-editorial-charcoal px-4 py-2 text-xs text-editorial-cream">Create badge</button></div>
    {initial && <BadgeForm initial={initial} locked={locked} submitLabel={editing === 'new' ? 'Save draft' : 'Save changes'} busy={create.isPending || save.isPending} onCancel={() => setEditing(null)} onSubmit={submit} />}
    <AdminListControls query={query} onChange={update}>
      <FilterField label="Active"><select value={query.isActive} onChange={e => update({ isActive: e.target.value })}><option value="">All</option><option value="true">Active</option><option value="false">Inactive</option></select></FilterField>
      <FilterField label="Sort by"><select value={query.sortBy} onChange={e => update({ sortBy: e.target.value })}><option>createdAt</option><option>name</option><option>order</option><option>isActive</option></select></FilterField>
      <FilterField label="Order"><select value={query.sortOrder} onChange={e => update({ sortOrder: e.target.value })}><option>DESC</option><option>ASC</option></select></FilterField>
    </AdminListControls>
    {error && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600">{error}</p>}
    <AdminListState loading={list.isLoading} error={list.error} empty={!list.data?.badges.length}><div className="space-y-3">{list.data?.badges.map(item => {
      const lifecycle = badgeLifecycle(item);
      return <article key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-editorial-card p-4">
        <div className="min-w-0 flex-1"><p className="text-sm font-bold">{item.name}</p><p className="text-[10px] text-editorial-charcoal/50">{item.code} · order {item.order} · {lifecycle}</p></div>
        <button type="button" title="Edit" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)} className="rounded-full border p-2"><Pencil className="h-4 w-4" /></button>
        {lifecycle !== 'Active' && <button type="button" title="Activate" aria-label={`Activate ${item.name}`} onClick={() => setConfirm({ id: item.id, action: 'activate' })} className="rounded-full border p-2"><Play className="h-4 w-4" /></button>}
        {lifecycle === 'Active' && <button type="button" title="Retire" aria-label={`Retire ${item.name}`} onClick={() => setConfirm({ id: item.id, action: 'retire' })} className="rounded-full border p-2"><Archive className="h-4 w-4" /></button>}
        {lifecycle !== 'Active' && <button type="button" title="Delete" aria-label={`Delete ${item.name}`} onClick={() => setConfirm({ id: item.id, action: 'delete' })} className="rounded-full border p-2"><Trash2 className="h-4 w-4 text-rose-600" /></button>}
      </article>;
    })}</div></AdminListState>
    {list.data && <AdminPagination page={list.data.page} limit={list.data.limit} total={list.data.total} totalPages={list.data.totalPages} onChange={update} />}
    <ConfirmDialog open={!!confirm} title={confirmTitle} description={confirmDescription} destructive={confirm?.action !== 'activate'} confirmLabel={confirm?.action === 'activate' ? 'Activate' : confirm?.action === 'retire' ? 'Retire' : 'Delete'} busy={confirmBusy} onCancel={() => setConfirm(null)} onConfirm={() => {
      if (!confirm) return;
      if (confirm.action === 'activate') void run('activate', () => save.mutateAsync({ id: confirm.id, input: { isActive: true } }));
      else if (confirm.action === 'retire') void run('retire', () => retire.mutateAsync(confirm.id));
      else void run('delete', () => remove.mutateAsync(confirm.id));
    }} />
  </div>;
}

export function AdminNotifications() {
  const { query, update } = useAdminListState('notifications', { page: 1, limit: 20, search: '', origin: '', audienceType: '' }); const list = useManagedNotifications({ ...query, origin: query.origin || undefined, audienceType: query.audienceType || undefined } as ManagedNotificationListParams); const create = useCreateAdminNotification(); const [form, setForm] = useState({ title: '', body: '', audienceType: 'all' as S['CreateAdminNotificationRequest']['audienceType'], targets: '' }); const [error, setError] = useState('');
  const submit = async () => { const input: S['CreateAdminNotificationRequest'] = { title: form.title, body: form.body, audienceType: form.audienceType }; const targets = form.targets.split(',').map(value => value.trim()).filter(Boolean); if (form.audienceType !== 'all' && !targets.length) return setError('Provide at least one comma-separated target.'); if (form.audienceType === 'users') input.targetUserIds = targets; if (form.audienceType === 'roles') input.targetRoles = targets as NonNullable<typeof input.targetRoles>; if (form.audienceType === 'tracks') input.targetTrackIds = targets; setError(''); try { await create.mutateAsync(input); setForm({ title: '', body: '', audienceType: 'all', targets: '' }); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Notification could not be sent.'); } };
  return <div className="space-y-4"><h2 className="text-2xl font-serif">Administrative notifications</h2><form onSubmit={event => { event.preventDefault(); submit(); }} className="grid gap-3 rounded-2xl border bg-editorial-card p-4 md:grid-cols-2"><input required maxLength={100} placeholder="Title" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} className="rounded-xl border bg-transparent p-2" /><select value={form.audienceType} onChange={e => setForm(v => ({ ...v, audienceType: e.target.value as typeof form.audienceType }))} className="rounded-xl border bg-editorial-card p-2"><option value="all">All users</option><option value="users">User IDs</option><option value="roles">Roles</option><option value="tracks">Track IDs</option></select><textarea required maxLength={500} placeholder="Message" value={form.body} onChange={e => setForm(v => ({ ...v, body: e.target.value }))} className="rounded-xl border bg-transparent p-2 md:col-span-2" />{form.audienceType !== 'all' && <input required placeholder="Comma-separated targets" value={form.targets} onChange={e => setForm(v => ({ ...v, targets: e.target.value }))} className="rounded-xl border bg-transparent p-2 md:col-span-2" />}{error && <p className="text-xs text-rose-600 md:col-span-2">{error}</p>}<button disabled={create.isPending} className="rounded-full bg-editorial-charcoal px-4 py-2 text-xs text-editorial-cream md:col-span-2"><Send className="mr-1 inline h-4 w-4" />Send notification</button></form><AdminListControls query={query} onChange={update}><FilterField label="Origin"><select value={query.origin} onChange={e => update({ origin: e.target.value })}><option value="">All</option><option value="admin">Admin</option><option value="system">System</option></select></FilterField><FilterField label="Audience"><select value={query.audienceType} onChange={e => update({ audienceType: e.target.value })}><option value="">All</option><option value="all">All users</option><option value="users">Users</option><option value="roles">Roles</option><option value="tracks">Tracks</option></select></FilterField></AdminListControls><AdminListState loading={list.isLoading} error={list.error} empty={!list.data?.notifications.length}><div className="space-y-3">{list.data?.notifications.map(item => <article key={item.id} className="rounded-2xl border bg-editorial-card p-4"><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-editorial-charcoal/60">{item.body}</p><p className="mt-2 text-[10px] text-editorial-charcoal/45">{item.origin} · {item.audienceType} · {item.readCount}/{item.recipientCount} read · {new Date(item.createdAt).toLocaleString()}</p></article>)}</div></AdminListState>{list.data && <AdminPagination page={list.data.page} limit={list.data.limit} total={list.data.total} totalPages={list.data.totalPages} onChange={update} />}</div>;
}

export function AdminAuditLogs() {
  const { query, update } = useAdminListState('logs', { page: 1, limit: 20, search: '', userId: '', entityName: '', action: '', startDate: '', endDate: '', sortBy: 'createdAt', sortOrder: 'DESC' }); const params = { page: query.page, limit: query.limit, userId: query.userId || undefined, entityName: query.entityName || query.search || undefined, action: query.action || undefined, startDate: query.startDate ? new Date(`${query.startDate}T00:00:00`).toISOString() : undefined, endDate: query.endDate ? new Date(`${query.endDate}T23:59:59`).toISOString() : undefined, sortBy: query.sortBy, sortOrder: query.sortOrder }; const list = useAuditLogs(params as AuditLogListParams);
  return <div className="space-y-4"><h2 className="text-2xl font-serif">Audit logs</h2><AdminListControls query={query} onChange={update} searchPlaceholder="Search entity"><FilterField label="User ID"><input value={query.userId} onChange={e => update({ userId: e.target.value })} /></FilterField><FilterField label="Entity"><input value={query.entityName} onChange={e => update({ entityName: e.target.value })} /></FilterField><FilterField label="Action"><input value={query.action} onChange={e => update({ action: e.target.value })} /></FilterField><FilterField label="Start date"><input type="date" value={query.startDate} onChange={e => update({ startDate: e.target.value })} /></FilterField><FilterField label="End date"><input type="date" value={query.endDate} onChange={e => update({ endDate: e.target.value })} /></FilterField><FilterField label="Sort by"><select value={query.sortBy} onChange={e => update({ sortBy: e.target.value })}><option>createdAt</option><option>action</option><option>entityName</option></select></FilterField><FilterField label="Order"><select value={query.sortOrder} onChange={e => update({ sortOrder: e.target.value })}><option>DESC</option><option>ASC</option></select></FilterField></AdminListControls><AdminListState loading={list.isLoading} error={list.error} empty={!list.data?.logs.length}><div className="space-y-3">{list.data?.logs.map(item => <article key={item.id} className="rounded-2xl border bg-editorial-card p-4"><p className="text-sm font-bold">{item.action} · {item.entityName}</p><p className="mt-1 text-[10px] text-editorial-charcoal/50">{item.entityId} · {item.user ? `${item.user.firstName} ${item.user.lastName || ''}` : item.userId || 'System'} · {new Date(item.createdAt).toLocaleString()}</p></article>)}</div></AdminListState>{list.data && <AdminPagination page={list.data.page} limit={list.data.limit} total={list.data.total} totalPages={list.data.totalPages} onChange={update} />}</div>;
}
