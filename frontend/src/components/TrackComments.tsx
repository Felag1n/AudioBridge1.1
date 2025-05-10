"use client"
import { FaHeart, FaRegHeart, FaReply, FaEllipsisH, FaTrash, FaUser } from 'react-icons/fa';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

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
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          text: newComment,
          parent_id: replyTo
        })
      });

      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        setReplyText('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
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
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`);
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

  const renderComment = (comment: Comment) => {
    const isReply = comment.parent_id !== null;
    const isOwner = user?.username === comment.username;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mb-6'}`}>
        <div className="flex items-start gap-3">
          <div 
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleUserClick(comment.username)}
          >
            {comment.user.avatar_path ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${comment.user.avatar_path}`}
                alt={comment.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="font-medium text-white cursor-pointer hover:underline"
                onClick={() => handleUserClick(comment.username)}
              >
                {comment.username}
              </span>
              <span className="text-sm text-gray-400">{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-gray-300 mb-2">{comment.text}</p>
            <div className="flex items-center gap-4">
              {!isReply && (
                <button
                  onClick={() => {
                    setReplyTo(comment.id);
                    setReplyText('');
                  }}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <FaReply />
                  Ответить
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <FaTrash />
                  Удалить
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyTo === comment.id && (
              <div className="mt-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Написать ответ..."
                  className="w-full bg-[#181818] text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyText('');
                    }}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!replyText.trim()) return;
                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/comments`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                          },
                          body: JSON.stringify({
                            text: replyText,
                            parent_id: comment.id
                          })
                        });

                        if (response.ok) {
                          setReplyTo(null);
                          setReplyText('');
                          fetchComments();
                        }
                      } catch (error) {
                        console.error('Error posting reply:', error);
                      }
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Ответить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {isAuthenticated && !replyTo && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {user?.avatar_path ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar_path}`}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="w-full bg-[#181818] text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments
          .filter(comment => !comment.parent_id)
          .map(comment => (
            <div key={comment.id}>
              {renderComment(comment)}
              {comments
                .filter(reply => reply.parent_id === comment.id)
                .map(reply => renderComment(reply))}
            </div>
          ))}
      </div>
    </div>
  );
} 