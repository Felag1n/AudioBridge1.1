import { FaHeart, FaRegHeart, FaReply, FaEllipsisH, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface User {
  username: string;
  full_name: string | null;
  nickname: string | null;
  avatar_path: string | null;
}

interface Comment {
  id: string;
  track_id: string;
  username: string;
  text: string;
  created_at: string;
  parent_id: string | null;
  user: User;
}

interface TrackCommentsProps {
  trackId: string;
}

export default function TrackComments({ trackId }: TrackCommentsProps) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [trackId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ text: newComment })
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          text: replyText,
          parent_id: replyingTo
        })
      });

      if (response.ok) {
        const newReplyData = await response.json();
        setComments(prev => [newReplyData, ...prev]);
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="bg-[#181818] p-4 rounded-lg">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <textarea
                className="w-full bg-[#282828] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Write a comment..."
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button 
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-[#181818] p-4 rounded-lg">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.user.nickname || comment.user.username}</span>
                    <span className="text-sm text-gray-400">{formatDate(comment.created_at)}</span>
                  </div>
                  {isAuthenticated && comment.username === localStorage.getItem('username') && (
                    <button 
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <p className="text-gray-300 mb-3">{comment.text}</p>
                {isAuthenticated && (
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <button 
                      className="flex items-center gap-1 hover:text-white transition-colors"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      <FaReply />
                      <span>Reply</span>
                    </button>
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <form onSubmit={handleReply} className="mt-4 pl-4 border-l-2 border-gray-700">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <textarea
                          className="w-full bg-[#282828] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Write a reply..."
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                          <button 
                            type="submit"
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!replyText.trim()}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Replies */}
                {comments
                  .filter(reply => reply.parent_id === comment.id)
                  .map((reply) => (
                    <div key={reply.id} className="mt-4 pl-4 border-l-2 border-gray-700">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{reply.user.nickname || reply.user.username}</span>
                              <span className="text-sm text-gray-400">{formatDate(reply.created_at)}</span>
                            </div>
                            {isAuthenticated && reply.username === localStorage.getItem('username') && (
                              <button 
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                onClick={() => handleDelete(reply.id)}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-300 mb-2">{reply.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 