import React, { useState } from 'react';
import { Heart, Loader2, MessageCircle, Plus, Send, Trash2, Users } from 'lucide-react';
import type { Donor } from '../types';
import { useLanguage } from '../LanguageContext';
import {
  useCreatePrayerComment, useCreatePrayerThread, useDeletePrayerComment,
  useDeletePrayerThread, usePrayerComments, usePrayerReaction, usePrayerThreads,
} from '../api/hooks';
import { ApiError } from '../api/client';
import { prayerCommentToDisplay, prayerThreadToDisplay, type PrayerThreadDisplay } from '../api/adapters';

interface PrayerWallProps { currentUser: Donor }

function requestError(error: unknown) {
  return error instanceof ApiError ? error.message : 'The prayer wall request could not be completed.';
}

function ThreadCard({ thread, currentUser }: { thread: PrayerThreadDisplay; currentUser: Donor }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const comments = usePrayerComments(thread.id, { page: 1, limit: 50 }, expanded);
  const createComment = useCreatePrayerComment();
  const deleteComment = useDeletePrayerComment();
  const deleteThread = useDeletePrayerThread();
  const reaction = usePrayerReaction();
  const authorName = thread.authorName;
  const owned = thread.authorId === currentUser.donor_id;

  const addComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    await createComment.mutateAsync({ id: thread.id, input: { body: comment.trim(), isAnonymous: anonymous } });
    setComment('');
  };

  return (
    <article className="p-5 border-b border-editorial-charcoal/10 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-editorial-charcoal/5 flex items-center justify-center text-sm font-bold shrink-0">{authorName.charAt(0).toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-editorial-charcoal">{authorName}</p>
              <p className="text-[9px] uppercase tracking-wider text-editorial-charcoal/45">{thread.type} · {new Date(thread.createdAt).toLocaleDateString()}</p>
            </div>
            {owned && <button type="button" aria-label={t('Delete thread', 'حذف الطلب')} disabled={deleteThread.isPending} onClick={() => deleteThread.mutate(thread.id)} className="p-2 text-editorial-charcoal/35 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-editorial-charcoal/80 whitespace-pre-wrap">{thread.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" disabled={reaction.isPending} onClick={() => reaction.mutate({ id: thread.id, type: 'like', active: thread.reactions.viewerHasLiked })} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 ${thread.reactions.viewerHasLiked ? 'bg-rose-500/10 border-rose-500/25 text-rose-700' : 'border-editorial-charcoal/10'}`}><Heart className={`w-3.5 h-3.5 ${thread.reactions.viewerHasLiked ? 'fill-current' : ''}`} /> {thread.reactions.likeCount}</button>
            <button type="button" disabled={reaction.isPending} onClick={() => reaction.mutate({ id: thread.id, type: 'join_prayer', active: thread.reactions.viewerHasJoinedPrayer })} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 ${thread.reactions.viewerHasJoinedPrayer ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700' : 'border-editorial-charcoal/10'}`}><Users className="w-3.5 h-3.5" /> {thread.reactions.joinPrayerCount} {t('praying', 'يصلون')}</button>
            <button type="button" onClick={() => setExpanded(value => !value)} className="rounded-full border border-editorial-charcoal/10 px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> {thread.commentCount}</button>
          </div>

          {expanded && (
            <div className="mt-4 space-y-3 border-t border-editorial-charcoal/10 pt-4">
              {comments.isLoading && <Loader2 className="w-4 h-4 animate-spin text-editorial-charcoal/40" />}
              {comments.data?.comments.map(prayerCommentToDisplay).map(item => {
                const commentAuthor = item.authorName;
                return <div key={item.id} className="rounded-2xl bg-editorial-charcoal/5 p-3 text-xs">
                  <div className="flex justify-between gap-2"><span className="font-bold">{commentAuthor}</span>{item.authorId === currentUser.donor_id && <button type="button" onClick={() => deleteComment.mutate({ threadId: thread.id, commentId: item.id })}><Trash2 className="w-3.5 h-3.5 text-rose-600" /></button>}</div>
                  <p className="mt-1 text-editorial-charcoal/70">{item.body}</p>
                </div>;
              })}
              <form onSubmit={addComment} className="space-y-2">
                <div className="flex gap-2"><input value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} placeholder={t('Write a comment…', 'اكتب تعليقاً…')} className="min-w-0 flex-1 rounded-full border border-editorial-charcoal/15 bg-transparent px-4 py-2 text-xs outline-none" /><button disabled={!comment.trim() || createComment.isPending} className="w-9 h-9 rounded-full bg-editorial-charcoal text-editorial-cream flex items-center justify-center disabled:opacity-40"><Send className="w-3.5 h-3.5" /></button></div>
                <label className="flex items-center gap-2 text-[10px] text-editorial-charcoal/55"><input type="checkbox" checked={anonymous} onChange={event => setAnonymous(event.target.checked)} />{t('Post anonymously', 'النشر بشكل مجهول')}</label>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function PrayerWall({ currentUser }: PrayerWallProps) {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<'all' | 'prayer' | 'praise'>('all');
  const [page, setPage] = useState(1);
  const [body, setBody] = useState('');
  const [type, setType] = useState<'prayer' | 'praise'>('prayer');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const threads = usePrayerThreads({ page, limit: 10, type: filterType });
  const createThread = useCreatePrayerThread();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;
    setError('');
    try {
      await createThread.mutateAsync({ body: body.trim(), type, isAnonymous: anonymous });
      setBody('');
      setAnonymous(false);
      setPage(1);
    } catch (requestFailure) {
      setError(requestError(requestFailure));
    }
  };

  return (
    <section id="prayer-feed" className="bg-editorial-card border border-editorial-charcoal/10 rounded-3xl overflow-hidden shadow-sm mt-8 max-w-2xl mx-auto flex flex-col min-h-[640px] max-h-[80vh]">
      <header className="p-5 border-b border-editorial-charcoal/10">
        <div className="flex items-center gap-2 mb-4"><Heart className="w-5 h-5 text-rose-600" /><h2 className="text-xl font-serif font-bold">{t('Prayer Wall', 'حائط الصلاة')}</h2></div>
        <div className="flex gap-2">{(['all', 'prayer', 'praise'] as const).map(option => <button key={option} onClick={() => { setFilterType(option); setPage(1); }} className={`flex-1 rounded-full py-2 text-[10px] uppercase font-bold ${filterType === option ? 'bg-editorial-charcoal text-editorial-cream' : 'bg-editorial-charcoal/5'}`}>{option}</button>)}</div>
      </header>

      <form onSubmit={submit} className="p-5 border-b border-editorial-charcoal/10 space-y-3">
        <textarea value={body} onChange={event => setBody(event.target.value)} maxLength={2000} placeholder={t('Share a prayer request or praise…', 'شارك طلب صلاة أو تسبيح…')} className="w-full min-h-24 resize-none rounded-2xl border border-editorial-charcoal/15 bg-transparent p-4 text-sm outline-none" />
        <div className="flex flex-wrap items-center gap-3"><select value={type} onChange={event => setType(event.target.value as 'prayer' | 'praise')} className="rounded-full border border-editorial-charcoal/15 bg-editorial-card px-3 py-2 text-xs"><option value="prayer">{t('Prayer', 'صلاة')}</option><option value="praise">{t('Praise', 'تسبيح')}</option></select><label className="flex items-center gap-2 text-[10px]"><input type="checkbox" checked={anonymous} onChange={event => setAnonymous(event.target.checked)} />{t('Anonymous', 'مجهول')}</label><button disabled={!body.trim() || createThread.isPending} className="ml-auto rounded-full bg-editorial-charcoal text-editorial-cream px-4 py-2 text-[10px] font-bold uppercase flex items-center gap-2 disabled:opacity-40">{createThread.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}{t('Share', 'مشاركة')}</button></div>
        {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
      </form>

      <div className="flex-1 overflow-y-auto">
        {threads.isLoading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div> : threads.error ? <div role="alert" className="p-8 text-center text-sm text-rose-600">{requestError(threads.error)}</div> : threads.data?.threads.length ? threads.data.threads.map(prayerThreadToDisplay).map(thread => <ThreadCard key={thread.id} thread={thread} currentUser={currentUser} />) : <div className="p-12 text-center text-sm text-editorial-charcoal/50">{t('No posts in this view yet.', 'لا توجد منشورات في هذا العرض بعد.')}</div>}
      </div>

      {(threads.data?.totalPages || 0) > 1 && <footer className="p-3 border-t border-editorial-charcoal/10 flex justify-center items-center gap-3"><button disabled={page === 1} onClick={() => setPage(value => value - 1)} className="text-xs disabled:opacity-30">{t('Previous', 'السابق')}</button><span className="text-[10px]">{page} / {threads.data?.totalPages}</span><button disabled={page === threads.data?.totalPages} onClick={() => setPage(value => value + 1)} className="text-xs disabled:opacity-30">{t('Next', 'التالي')}</button></footer>}
    </section>
  );
}
