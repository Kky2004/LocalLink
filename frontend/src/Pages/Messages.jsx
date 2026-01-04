import  { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { messageService } from '../Service/messageService';
import { Send, MessageCircle } from 'lucide-react';

export default function Messages  ()  {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const loadData = async () => {
      await loadMessages();
      
      const userIdFromUrl = searchParams.get('user');
      if (userIdFromUrl) {
        await fetchUserInfo(userIdFromUrl);
        setSelectedUserId(userIdFromUrl);
      }
    };
    
    loadData();
  }, [searchParams]);

  const fetchUserInfo = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/providers/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUserNames(prev => ({ ...prev, [userId]: userData.name }));
      } else {
        console.error('Failed to fetch user, status:', response.status);
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      loadConversation(selectedUserId);
    }
  }, [selectedUserId]);

  const loadMessages = async () => {
    try {
      const data = await messageService.getUserMessages();
      console.log("message",data);
      
      setMessages(data);
      
      const names = {};
      data.forEach(msg => {
         console.log("senderid",msg.sender);
        console.log("recieverid",msg.receiver);
        if (msg.sender && msg.senderName) names[msg.sender] = msg.senderName;
        if (msg.receiver && msg.receiverName) names[msg.receiver] = msg.receiverName;
      });
      setUserNames(names);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const loadConversation = async (userId) => {
    try {
      const data = await messageService.getConversation(userId);
      console.log("conversation",data);
      setConversation(data);
      
      data.forEach(msg => {
        if (msg.receiver === user?._id && !msg.isRead) {
          messageService.markAsRead(msg._id);
        }
      });
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    setLoading(true);
    setError('');

    try {
      await messageService.sendMessage({
        receiverId: selectedUserId,
        content: newMessage,
      });
      setNewMessage('');
      loadConversation(selectedUserId);
      loadMessages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const conversations = messages.reduce((acc, msg) => {
    const otherUserId = msg.sender === user?._id ? msg.receiver : msg.sender;
    const otherUserName = msg.sender === user?._id ? msg.receiverName : msg.senderName;

    const existingConv = acc.find(c => c.userId === otherUserId);

    if (!existingConv) {
      acc.push({
        userId: otherUserId,
        userName: otherUserName || userNames[otherUserId] || 'User',
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt,
        unread: msg.receiverId === user?._id && !msg.isRead,
      });
    } else {
      if (new Date(msg.createdAt) > new Date(existingConv.lastMessageTime)) {
        existingConv.lastMessage = msg.content;
        existingConv.lastMessageTime = msg.createdAt;
      }
      if (msg.receiver === user?._id && !msg.isRead) {
        existingConv.unread = true;
      }
    }
    return acc;
  }, []);

  conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div>
                  {conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedUserId(conv.userId)}
                      className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                        selectedUserId === conv.userId ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{conv.userName}</p>
                          <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unread && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conversation View */}
            <div className="col-span-2 flex flex-col">
              {selectedUserId ? (
                <>
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-semibold">
                          {(conversations.find(c => c.userId === selectedUserId)?.userName || userNames[selectedUserId] || '?').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {conversations.find(c => c.userId === selectedUserId)?.userName || userNames[selectedUserId] || 'Loading...'}
                        </h3>
                        <p className="text-sm text-gray-500">Active now</p>
                      </div>
                    </div>
                  </div>
                  {/* messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversation.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === user._id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender === user._id ? 'text-primary-100' : 'text-gray-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Message form */}
                  <div className="border-t border-gray-200 p-4">
                    {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading || !newMessage.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


