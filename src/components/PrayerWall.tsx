import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share, User, Send, X, MoreHorizontal, Shield, Clock } from 'lucide-react';
import { getLocalizedAltarPostCategory, getLocalizedAltarPostText, getLocalizedDonorName } from '../utils/localization';

// --- Types ---
export interface FeedPostReply {
  id: string;
  postId: string;
  text: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  timestamp: string;
  timestampMs: number;
}

export interface FeedPost {
  id: string;
  type: 'prayer' | 'praise';
  text: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  isAnonymous: boolean;
  category: string;
  timestamp: string;
  timestampMs: number;
  lovesCount: number;
  repliesCount: number;
  praysCount: number;
  isAnswered?: boolean;
}

interface PrayerWallProps {
  currentUser: any;
  language: 'en' | 'ar';
}

const CATEGORIES = [
  'Personal Faith',
  'Family & Peace',
  'Healing & Health',
  'Youth Outreach',
];

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'seed-1',
    type: 'prayer',
    text: "Praying for the new digital outreach campaign launching next week in North Africa.",
    authorName: "Sarah M.",
    authorUsername: "sarah_m_prays",
    isAnonymous: false,
    category: "Media Frontiers",
    timestamp: "2h ago",
    timestampMs: Date.now() - 2 * 3600000,
    lovesCount: 24,
    repliesCount: 3,
    praysCount: 45,
  },
  {
    id: 'seed-2',
    type: 'praise',
    text: "Praise God! The new follow-up center is fully funded and operational.",
    authorName: "Anonymous",
    authorUsername: "anonymous",
    isAnonymous: true,
    category: "Follow-up",
    timestamp: "5h ago",
    timestampMs: Date.now() - 5 * 3600000,
    lovesCount: 156,
    repliesCount: 12,
    praysCount: 200,
  },
  {
    id: 'seed-3',
    type: 'prayer',
    text: "Please pray for my family's health during this difficult season.",
    authorName: "David K.",
    authorUsername: "david_k_77",
    isAnonymous: false,
    category: "Healing & Health",
    timestamp: "1d ago",
    timestampMs: Date.now() - 24 * 3600000,
    lovesCount: 45,
    repliesCount: 8,
    praysCount: 30,
  }
];

export const PrayerWall: React.FC<PrayerWallProps> = ({ currentUser, language }) => {
  const { t } = useLanguage();
  // --- State ---
  const [posts, setPosts] = useState<FeedPost[]>(() => {
    const saved = localStorage.getItem('blf_prayer_feed_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  
  const [replies, setReplies] = useState<FeedPostReply[]>(() => {
    const saved = localStorage.getItem('blf_prayer_feed_replies');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [lovedPosts, setLovedPosts] = useState<string[]>(() => {
    const saved = localStorage.getItem('blf_prayer_feed_loved');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [prayedPosts, setPrayedPosts] = useState<string[]>(() => {
    const saved = localStorage.getItem('blf_prayer_feed_prayed');
    return saved ? JSON.parse(saved) : [];
  });

  const handleTogglePray = (postId: string) => {
    setPrayedPosts(prev => {
      const isPrayed = prev.includes(postId);
      const newPrayed = isPrayed ? prev.filter(id => id !== postId) : [...prev, postId];
      localStorage.setItem('blf_prayer_feed_prayed', JSON.stringify(newPrayed));
      return newPrayed;
    });
    
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, praysCount: p.praysCount + (prayedPosts.includes(postId) ? -1 : 1) };
      }
      return p;
    }));
    
    // Save to local storage
    setTimeout(() => {
      setPosts(currentPosts => {
        localStorage.setItem('blf_prayer_feed_posts', JSON.stringify(currentPosts));
        return currentPosts;
      });
    }, 0);
  };
  
  const [userNickname, setUserNickname] = useState(() => {
    return localStorage.getItem('blf_prayer_nickname') || currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
  });
  
  const [filterType, setFilterType] = useState<'all' | 'prayer' | 'praise'>('all');
  
  // New Post State
  const [newPostText, setNewPostText] = useState('');
  const [postType, setPostType] = useState<'prayer' | 'praise'>('prayer');
  const [postCategory, setPostCategory] = useState(CATEGORIES[0]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Reply State
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('blf_prayer_feed_posts', JSON.stringify(posts));
  }, [posts]);
  
  useEffect(() => {
    localStorage.setItem('blf_prayer_feed_replies', JSON.stringify(replies));
  }, [replies]);
  
  useEffect(() => {
    localStorage.setItem('blf_prayer_feed_loved', JSON.stringify(lovedPosts));
  }, [lovedPosts]);
  
  useEffect(() => {
    localStorage.setItem('blf_prayer_nickname', userNickname);
  }, [userNickname]);

  // --- Handlers ---
  const handleToggleLove = (postId: string) => {
    const isLoved = lovedPosts.includes(postId);
    if (isLoved) {
      setLovedPosts(lovedPosts.filter(id => id !== postId));
      setPosts(posts.map(p => p.id === postId ? { ...p, lovesCount: Math.max(0, p.lovesCount - 1) } : p));
    } else {
      setLovedPosts([...lovedPosts, postId]);
      setPosts(posts.map(p => p.id === postId ? { ...p, lovesCount: p.lovesCount + 1 } : p));
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      type: postType,
      text: newPostText,
      authorName: currentUser.name,
      authorUsername: userNickname,
      authorAvatar: currentUser.avatar_url,
      isAnonymous,
      category: postCategory,
      timestamp: 'Just now',
      timestampMs: Date.now(),
      lovesCount: 0,
      repliesCount: 0,
      praysCount: 0,
    };
    
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };
  
  const handleCreateReply = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    const newReply: FeedPostReply = {
      id: `reply-${Date.now()}`,
      postId,
      text: replyText,
      authorName: currentUser.name,
      authorUsername: userNickname,
      authorAvatar: currentUser.avatar_url,
      timestamp: 'Just now',
      timestampMs: Date.now(),
    };
    
    setReplies([...replies, newReply]);
    setPosts(posts.map(p => p.id === postId ? { ...p, repliesCount: p.repliesCount + 1 } : p));
    setReplyText('');
    setReplyingTo(null);
  };

  // --- Render ---
  const filteredPosts = useMemo(() => {
    return posts.filter(p => filterType === 'all' || p.type === filterType).sort((a, b) => b.timestampMs - a.timestampMs);
  }, [posts, filterType]);

  return (
    <section id="prayer-feed" className="bg-editorial-card border border-editorial-charcoal/10 rounded-3xl overflow-hidden shadow-sm mt-8 max-w-2xl mx-auto flex flex-col h-[800px] max-h-[80vh]">
      
      {/* Header */}
      <div className="border-b border-editorial-charcoal/10 p-4 sm:p-6 bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <h3 className="text-xl font-serif font-bold text-editorial-charcoal mb-4">{t("Prayer Feed", "حائط الصلاة")}</h3>
        
        {/* Tabs */}
        <div className="flex border-b border-editorial-charcoal/10">
          {(['all', 'prayer', 'praise'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                filterType === tab ? 'text-editorial-charcoal' : 'text-editorial-charcoal/40 hover:text-editorial-charcoal/70'
              }`}
            >
              {tab === 'all' ? t("All", "الكل") : tab === 'prayer' ? t("Prayers", "صلوات") : t("Praises", "تسبيح")}
              {filterType === tab && (
                <motion.div layoutId="feed-tab-indicator" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 dark:bg-emerald-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Area */}
      <div className="flex-1 overflow-y-auto bg-editorial-soft/30">
        
                {/* Compose Post */}
        <div className="p-4 sm:p-6 border-b border-editorial-charcoal/5 bg-editorial-card">
          <form onSubmit={handleCreatePost} className="flex gap-4">
            <div className="shrink-0">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-editorial-charcoal/10 flex items-center justify-center font-bold text-editorial-charcoal">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <textarea
                value={newPostText}
                onChange={e => setNewPostText(e.target.value)}
                placeholder={t("Share a prayer request or praise...", "شارك طلبة صلاة أو تسبيح...")}
                className="w-full bg-transparent resize-none outline-none text-base placeholder:text-editorial-charcoal/40 font-sans min-h-[60px]"
              />
              
              <div className="flex items-center justify-between pt-2 border-t border-editorial-charcoal/10 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <select 
                    value={postType} 
                    onChange={e => setPostType(e.target.value as 'prayer'|'praise')}
                    className="text-xs font-bold text-editorial-charcoal/70 bg-editorial-soft px-2 py-1 rounded-md outline-none border border-editorial-charcoal/5"
                  >
                    <option value="prayer">{t("Prayer", "صلاة")}</option>
                    <option value="praise">{t("Praise", "تسبيح")}</option>
                  </select>
                  
                  <div className="flex items-center bg-editorial-soft px-2 py-1 rounded-md border border-editorial-charcoal/5">
                    <span className="text-xs text-editorial-charcoal/50 mr-1">@</span>
                    <input 
                      type="text"
                      value={userNickname}
                      onChange={e => setUserNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="bg-transparent outline-none text-xs text-editorial-charcoal/80 w-24"
                      placeholder={t("username", "اسم المستخدم")}
                    />
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-editorial-charcoal/60 font-bold uppercase tracking-wider">
                    <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="rounded-sm" />
                    {t("Anonymous", "مجهول")}
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={!newPostText.trim() || !userNickname.trim()}
                  className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-5 py-2 rounded-full font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {t("Post", "نشر")}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Posts List */}
        <div className="divide-y divide-editorial-charcoal/5">
          <AnimatePresence>
            {filteredPosts.map(post => {
              const isLoved = lovedPosts.includes(post.id);
              const postReplies = replies.filter(r => r.postId === post.id);
              const showReplies = replyingTo === post.id;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={post.id} 
                  className="p-4 sm:p-6 bg-editorial-card hover:bg-editorial-soft/10 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Avatar Column */}
                    <div className="shrink-0 flex flex-col items-center">
                      {post.isAnonymous ? (
                        <div className="w-10 h-10 rounded-full bg-editorial-charcoal/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-editorial-charcoal/40" />
                        </div>
                      ) : post.authorAvatar ? (
                        <img src={post.authorAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-300">
                          {post.authorName.charAt(0)}
                        </div>
                      )}
                      
                      {/* Connection Line to replies if showing */}
                      {showReplies && postReplies.length > 0 && (
                        <div className="w-0.5 h-full bg-editorial-charcoal/10 my-2" />
                      )}
                    </div>
                    
                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-sm truncate">
                          <span className="font-bold text-editorial-charcoal truncate">
                            {post.isAnonymous ? t("Anonymous", "مجهول") : post.authorName}
                          </span>
                          {!post.isAnonymous && (
                            <span className="text-editorial-charcoal/50 truncate">@{post.authorUsername}</span>
                          )}
                          <span className="text-editorial-charcoal/30 shrink-0">·</span>
                          <span className="text-editorial-charcoal/50 shrink-0 hover:underline cursor-pointer">{post.timestamp}</span>
                        </div>
                        <button className="text-editorial-charcoal/30 hover:text-editorial-charcoal/70 p-1 rounded-full hover:bg-editorial-soft transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Category Tag */}
                      <div className="mb-2">
                         <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${
                           post.type === 'prayer' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                         }`}>
                           {post.type === 'prayer' ? t("Prayer Request", "طلبة صلاة") : t("Praise", "تسبيح")} • {post.category}
                         </span>
                      </div>
                      
                      {/* Body */}
                      <p className="text-editorial-charcoal/90 text-[15px] leading-relaxed mb-3 font-sans">
                        {post.text}
                      </p>
                      
                      {/* Action Bar */}
                      <div className="flex items-center justify-between text-editorial-charcoal/50 max-w-md">
                        <button 
                          onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                          className="flex items-center gap-2 hover:text-emerald-600 dark:text-emerald-400 transition-colors group"
                        >
                          <div className="p-1.5 rounded-full group-hover:bg-emerald-50 dark:bg-emerald-950/30">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-medium">{post.repliesCount}</span>
                        </button>
                        
                        <button 
                          onClick={() => handleToggleLove(post.id)}
                          className={`flex items-center gap-2 transition-colors group ${isLoved ? 'text-rose-500 dark:text-rose-400' : 'hover:text-rose-500 dark:text-rose-400'}`}
                        >
                          <div className={`p-1.5 rounded-full ${isLoved ? 'bg-rose-50 dark:bg-rose-950/30' : 'group-hover:bg-rose-50 dark:bg-rose-950/30'}`}>
                            <Heart className={`w-4 h-4 ${isLoved ? 'fill-rose-500' : ''}`} />
                          </div>
                          <span className="text-xs font-medium">{post.lovesCount}</span>
                        </button>
                        
                        <button 
                          onClick={() => handleTogglePray(post.id)}
                          className={`flex items-center gap-2 transition-colors group ${prayedPosts.includes(post.id) ? 'text-amber-600 dark:text-amber-400' : 'hover:text-amber-600 dark:text-amber-400'}`}
                          title={t("Join in Prayer", "شارك في الصلاة")}
                        >
                          <div className={`p-1.5 rounded-full ${prayedPosts.includes(post.id) ? 'bg-amber-50 dark:bg-amber-950/30' : 'group-hover:bg-amber-50 dark:bg-amber-950/30'}`}>
                            <User className={`w-4 h-4 ${prayedPosts.includes(post.id) ? 'fill-amber-600' : ''}`} />
                          </div>
                          <span className="text-xs font-medium">{post.praysCount || 0}</span>
                        </button>
                        
                        <button className="flex items-center gap-2 hover:text-blue-500 dark:text-blue-400 transition-colors group">
                          <div className="p-1.5 rounded-full group-hover:bg-blue-50 dark:bg-blue-950/30">
                            <Share className="w-4 h-4" />
                          </div>
                        </button>
                      </div>
                      
                      {/* Replies Area */}
                      <AnimatePresence>
                        {showReplies && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-4"
                          >
                            {/* Existing Replies */}
                            {postReplies.map(reply => (
                              <div key={reply.id} className="flex gap-3">
                                {reply.authorAvatar ? (
                                  <img src={reply.authorAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-editorial-charcoal/10 flex items-center justify-center font-bold text-xs text-editorial-charcoal shrink-0">
                                    {reply.authorName.charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1 bg-editorial-soft/30 rounded-2xl px-4 py-3 border border-editorial-charcoal/5">
                                  <div className="flex items-center gap-2 text-xs mb-1">
                                    <span className="font-bold text-editorial-charcoal">{reply.authorName}</span>
                                    <span className="text-editorial-charcoal/50">@{reply.authorUsername}</span>
                                    <span className="text-editorial-charcoal/30">·</span>
                                    <span className="text-editorial-charcoal/50">{reply.timestamp}</span>
                                  </div>
                                  <p className="text-sm text-editorial-charcoal/80">{reply.text}</p>
                                </div>
                              </div>
                            ))}
                            
                            {/* Reply Input */}
                            <form onSubmit={e => handleCreateReply(e, post.id)} className="flex gap-3 items-center mt-2">
                               {currentUser.avatar_url ? (
                                  <img src={currentUser.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-editorial-charcoal/10 flex items-center justify-center font-bold text-xs text-editorial-charcoal shrink-0">
                                    {currentUser.name.charAt(0)}
                                  </div>
                                )}
                              <input 
                                type="text"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder={t("Post your reply...", "أضف ردك...")}
                                className="flex-1 bg-editorial-soft/50 border border-editorial-charcoal/10 rounded-full px-4 py-2 text-sm outline-none focus:border-emerald-500 dark:border-emerald-400 dark:focus:border-emerald-400 transition-colors"
                              />
                              <button 
                                type="submit" 
                                disabled={!replyText.trim()}
                                className="p-2 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white disabled:opacity-50 hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filteredPosts.length === 0 && (
            <div className="p-8 text-center text-editorial-charcoal/40 space-y-3">
              <MessageCircle className="w-8 h-8 mx-auto opacity-20" />
              <p>{t("No posts found in this category.", "لا توجد منشورات في هذا القسم.")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
