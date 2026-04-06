'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function FeedClient({ currentUser }: { currentUser: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!content.trim() && !selectedFile) return;
    
    setUploading(true);
    let imageUrl = null;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('post_images')
          .upload(fileName, selectedFile);

        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('post_images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          imageUrl,
          isPublic
        })
      });

      if (res.ok) {
        setContent('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
      alert("Error uploading image or creating post. Make sure 'post_images' bucket exists in Supabase Storage and is public.");
    } finally {
      setUploading(false);
    }
  };

  const togglePostLike = async (postId: number) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCommentLike = async (commentId: number) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
      if (res.ok) fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const submitComment = async (postId: number, commentContent: string, parentId?: number) => {
     if (!commentContent.trim()) return;
     try {
       const res = await fetch('/api/comments', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ postId, content: commentContent, parentId })
       });
       if (res.ok) fetchPosts();
     } catch (e) {
        console.error(e);
     }
  };

  const formatLikes = (likes: any[]) => {
    if (!likes || likes.length === 0) return null;
    const names = likes.map(l => `${l.user.firstName} ${l.user.lastName}`);
    return `Liked by: ${names.join(', ')}`;
  };

  const renderComments = (comments: any[], parentId: number | null = null, depth = 0) => {
    return comments
      .filter(c => c.parentId === parentId)
      .map(comment => (
        <div key={comment.id} className="_comment_main" style={{ marginTop: '16px', marginLeft: depth > 0 ? `${depth * 20}px` : '0' }}>
          <div className="_comment_image">
            <img src="/assets/images/Avatar.png" alt="" className="_comment_img1" />
          </div>
          <div className="_comment_area" style={{ width: '100%' }}>
            <div className="_comment_details">
              <div className="_comment_details_top">
                <div className="_comment_name">
                  <h4 className="_comment_name_title">{comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'User'}</h4>
                </div>
              </div>
              <div className="_comment_status">
                <p className="_comment_status_text"><span>{comment.content}</span></p>
              </div>
            </div>
            <div className="_comment_reply" style={{ marginTop: '4px', fontSize: '12px', display: 'flex', gap: '10px' }}>
               <button 
                className={`_link ${comment.likes?.find((l:any) => l.userId === currentUser.id) ? 'text-primary' : ''}`}
                onClick={() => toggleCommentLike(comment.id)}
               >
                 Like ({comment.likes?.length || 0})
               </button>
               <ReplyButton commentId={comment.id} postId={comment.postId} submitComment={submitComment} />
            </div>
            {comment.likes?.length > 0 && (
              <p style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{formatLikes(comment.likes)}</p>
            )}
            {renderComments(comments, comment.id, depth + 1)}
          </div>
        </div>
      ));
  };

  return (
    <div className="_layout_middle_inner">
      <div className="d-flex justify-content-between align-items-center _mar_b16">
        <h3 className="_title4 mb-0">Feed</h3>
        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">Sign Out</button>
      </div>

      <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
        <div className="_feed_inner_text_area_box">
          <div className="_feed_inner_text_area_box_image">
            <img src="/assets/images/Avatar.png" alt="Image" className="_txt_img" />
          </div>
          <div className="form-floating _feed_inner_text_area_box_form">
            <textarea
              className="form-control _textarea"
              placeholder="Write something ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            {content.length === 0 && <label className="_feed_textarea_label">Write something ...</label>}
          </div>
        </div>
        
        {selectedFile && (
          <div style={{ marginTop: '10px', position: 'relative' }}>
             <img src={URL.createObjectURL(selectedFile)} alt="Preview" style={{ maxWidth: '100px', borderRadius: '4px' }} />
             <button onClick={() => setSelectedFile(null)} className="btn btn-sm btn-danger" style={{ position: 'absolute', top: 0, left: '110px' }}>Clear</button>
          </div>
        )}

        <div className="_feed_inner_text_area_bottom" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                    📷 Add Image
                </button>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                  <label className="form-check-label" style={{ fontSize: '13px' }}>{isPublic ? 'Public' : 'Private'}</label>
                </div>
            </div>
            <button type="button" className="_feed_inner_text_area_btn_link" onClick={handlePostSubmit} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Post'}
            </button>
        </div>
      </div>

      {loading ? <p>Loading posts...</p> : posts.map((post) => (
        <div key={post.id} className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
          <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
            <div className="_feed_inner_timeline_post_top">
              <div className="_feed_inner_timeline_post_box">
                <div className="_feed_inner_timeline_post_box_image">
                  <img src="/assets/images/Avatar.png" alt="" className="_post_img" />
                </div>
                <div className="_feed_inner_timeline_post_box_txt">
                  <h4 className="_feed_inner_timeline_post_box_title">{post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown'}</h4>
                  <p className="_feed_inner_timeline_post_box_para">
                    {new Date(post.createdAt).toLocaleString()} . <span className="badge bg-light text-dark">{post.isPublic ? 'Public' : 'Private'}</span>
                    {post.user?.id === currentUser?.id && (
                      <button onClick={() => handleDeletePost(post.id)} className="btn btn-link text-danger p-0 ms-2" style={{ fontSize: '12px', textDecoration: 'none' }}>Delete</button>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <h4 className="_feed_inner_timeline_post_title" style={{ marginTop: '16px', fontWeight: 'normal' }}>{post.content}</h4>
            {post.imageUrl && (
              <div className="_feed_inner_timeline_image" style={{ marginTop: '12px' }}>
                <img src={post.imageUrl} alt="" className="_time_img" style={{ borderRadius: '8px' }} />
              </div>
            )}
          </div>
          
          <div className="_padd_r24 _padd_l24" style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '12px', color: '#666' }}>{formatLikes(post.likes)}</p>
          </div>

          <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
            <div className="_feed_inner_timeline_total_reacts_txt" style={{ marginLeft: 0 }}>
              <p className="_feed_inner_timeline_total_reacts_para1"><span>{post.likes?.length || 0}</span> Likes</p>
              <p className="_feed_inner_timeline_total_reacts_para1"><span>{post.comments?.length || 0}</span> Comments</p>
            </div>
          </div>

          <div className="_feed_inner_timeline_reaction">
            <button 
              className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${post.likes?.find((l:any) => l.userId === currentUser.id) ? '_feed_reaction_active' : ''}`}
              onClick={() => togglePostLike(post.id)}
            >
              <span className="_feed_inner_timeline_reaction_link"> Like </span>
            </button>
            <button className="_feed_inner_timeline_reaction_comment _feed_reaction">
               <span className="_feed_inner_timeline_reaction_link"> Comment </span>
            </button>
          </div>

          <div className="_feed_inner_timeline_cooment_area" style={{ marginTop: '16px' }}>
              <CommentBox postId={post.id} submitComment={submitComment} />
              <div className="_timline_comment_main">
                 {renderComments(post.comments || [])}
              </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReplyButton({ commentId, postId, submitComment }: any) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState('');
  
  if (!show) return <button className="_link" onClick={() => setShow(true)}>Reply</button>;

  return (
    <div style={{ marginTop: '8px', width: '100%' }}>
      <input 
        className="form-control form-control-sm" 
        placeholder="Write a reply..." 
        value={val} 
        onChange={(e) => setVal(e.target.value)}
        autoFocus
      />
      <div style={{ marginTop: '4px' }}>
        <button className="btn btn-xs btn-primary me-2" style={{ fontSize: '10px' }} onClick={() => { submitComment(postId, val, commentId); setVal(''); setShow(false); }}>Send</button>
        <button className="btn btn-xs btn-light" style={{ fontSize: '10px' }} onClick={() => setShow(false)}>Cancel</button>
      </div>
    </div>
  );
}

function CommentBox({ postId, submitComment }: { postId: number, submitComment: (postId: number, content: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <div className="_feed_inner_comment_box">
      <div className="_feed_inner_comment_box_form" style={{ display: 'flex', width: '100%' }}>
        <div className="_feed_inner_comment_box_content" style={{ flexGrow: 1 }}>
          <div className="_feed_inner_comment_box_image"><img src="/assets/images/Avatar.png" alt="" className="_comment_img" /></div>
          <div className="_feed_inner_comment_box_content_txt" style={{ flexGrow: 1 }}>
            <textarea className="form-control _comment_textarea" placeholder="Write a comment" value={val} onChange={(e) => setVal(e.target.value)}></textarea>
          </div>
        </div>
        <div className="_feed_inner_comment_box_icon">
          <button type="button" className="btn btn-primary" onClick={() => { submitComment(postId, val); setVal(''); }}>Comment</button>
        </div>
      </div>
    </div>
  );
}
