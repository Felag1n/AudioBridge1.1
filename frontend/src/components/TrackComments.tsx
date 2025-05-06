import { FaHeart, FaRegHeart, FaReply, FaEllipsisH } from 'react-icons/fa';
import Image from 'next/image';
import { useState } from 'react';

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface TrackCommentsProps {
  comments: Comment[];
}

export default function TrackComments({ comments }: TrackCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle comment submission
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
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

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-[#181818] p-4 rounded-lg">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.user.name}</span>
                    <span className="text-sm text-gray-400">{comment.timestamp}</span>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <FaEllipsisH />
                  </button>
                </div>
                <p className="text-gray-300 mb-3">{comment.text}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    {comment.isLiked ? <FaHeart className="text-orange-500" /> : <FaRegHeart />}
                    <span>{comment.likes}</span>
                  </button>
                  <button 
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <FaReply />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <form onSubmit={handleSubmit} className="mt-4 pl-4 border-l-2 border-gray-700">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <textarea
                          className="w-full bg-[#282828] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Write a reply..."
                          rows={2}
                        />
                        <div className="flex justify-end mt-2">
                          <button 
                            type="submit"
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-700">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{reply.user.name}</span>
                              <span className="text-sm text-gray-400">{reply.timestamp}</span>
                            </div>
                            <button className="text-gray-400 hover:text-white transition-colors">
                              <FaEllipsisH />
                            </button>
                          </div>
                          <p className="text-gray-300 mb-2">{reply.text}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <button className="flex items-center gap-1 hover:text-white transition-colors">
                              {reply.isLiked ? <FaHeart className="text-orange-500" /> : <FaRegHeart />}
                              <span>{reply.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 