import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, ShieldCheck, User, Clock, Sparkles } from 'lucide-react';

interface MessagesViewProps {
  messages: ChatMessage[];
  onSendMessage: (params: { itemId: number; itemTitle: string; recipient: string; message: string }) => void;
  onBrowseClick: () => void;
  onSwitchDemoUser?: (role: 'student' | 'lender') => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  messages,
  onSendMessage,
  onBrowseClick,
  onSwitchDemoUser,
}) => {
  const { currentUser, studentName } = useAuth();
  const currentUserName = (studentName || currentUser?.displayName || 'You').trim();

  // Helper to check if a message belongs to current user
  const isMessageRelevant = React.useCallback(
    (msg: ChatMessage): boolean => {
      if (!currentUser) return true; // Guest view
      const normCurrent = currentUserName.toLowerCase();
      const normEmail = (currentUser.email || '').toLowerCase();
      const emailPrefix = normEmail ? normEmail.split('@')[0] : '';

      const sender = (msg.sender || '').trim().toLowerCase();
      const recipient = (msg.recipient || '').trim().toLowerCase();
      const senderEmail = (msg.senderEmail || '').trim().toLowerCase();
      const recipientEmail = (msg.recipientEmail || '').trim().toLowerCase();

      // Matches current user as sender or recipient
      if (
        sender === 'you' ||
        recipient === 'you' ||
        sender === normCurrent ||
        recipient === normCurrent ||
        (emailPrefix && (sender === emailPrefix || recipient === emailPrefix)) ||
        (normEmail && (senderEmail === normEmail || recipientEmail === normEmail))
      ) {
        return true;
      }

      return false;
    },
    [currentUser, currentUserName]
  );

  // Helper to determine the other peer in a message
  const getPeerForMessage = React.useCallback(
    (msg: ChatMessage): string => {
      const normCurrent = currentUserName.toLowerCase();
      const normEmail = (currentUser?.email || '').toLowerCase();
      const emailPrefix = normEmail ? normEmail.split('@')[0] : '';

      const sender = (msg.sender || '').trim();
      const recipient = (msg.recipient || '').trim();
      const senderEmail = (msg.senderEmail || '').trim().toLowerCase();
      const recipientEmail = (msg.recipientEmail || '').trim().toLowerCase();

      // If current user is sender, peer is recipient
      if (
        sender === 'You' ||
        sender.toLowerCase() === normCurrent ||
        (emailPrefix && sender.toLowerCase() === emailPrefix) ||
        (normEmail && senderEmail === normEmail)
      ) {
        return recipient === 'You' ? 'Lender' : recipient;
      }

      // If current user is recipient, peer is sender
      if (
        recipient === 'You' ||
        recipient.toLowerCase() === normCurrent ||
        (emailPrefix && recipient.toLowerCase() === emailPrefix) ||
        (normEmail && recipientEmail === normEmail)
      ) {
        return sender;
      }

      return recipient.toLowerCase() !== normCurrent ? recipient : sender;
    },
    [currentUserName, currentUser]
  );

  // Helper to check if message was sent by current user
  const isMessageFromMe = React.useCallback(
    (msg: ChatMessage): boolean => {
      const normCurrent = currentUserName.toLowerCase();
      const normEmail = (currentUser?.email || '').toLowerCase();
      const emailPrefix = normEmail ? normEmail.split('@')[0] : '';
      const sender = (msg.sender || '').trim().toLowerCase();
      const senderEmail = (msg.senderEmail || '').trim().toLowerCase();

      if (sender === 'you') return true;
      if (sender === normCurrent) return true;
      if (emailPrefix && sender === emailPrefix) return true;
      if (normEmail && senderEmail === normEmail) return true;

      return false;
    },
    [currentUserName, currentUser]
  );

  // Group messages into conversations
  const threads = React.useMemo(() => {
    const relevant = messages.filter(isMessageRelevant);
    const map = new Map<string, ChatMessage[]>();

    relevant.forEach((msg) => {
      const peer = getPeerForMessage(msg);
      if (!peer) return;
      const key = `${peer}-${msg.itemId || 0}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(msg);
    });

    return Array.from(map.entries()).map(([key, msgs]) => {
      const peer = getPeerForMessage(msgs[0]);
      return {
        key,
        peer,
        itemTitle: msgs[0]?.itemTitle || 'Rental Inquiry',
        itemId: msgs[0]?.itemId || 0,
        lastMessage: msgs[msgs.length - 1],
        messages: msgs,
      };
    });
  }, [messages, isMessageRelevant, getPeerForMessage]);

  const [activeKey, setActiveKey] = useState<string>(() => threads[0]?.key || '');
  const [inputText, setInputText] = useState('');

  // Keep activeKey valid if threads change
  const currentThread = threads.find((t) => t.key === activeKey) || threads[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentThread) return;

    onSendMessage({
      itemId: currentThread.itemId,
      itemTitle: currentThread.itemTitle,
      recipient: currentThread.peer,
      message: inputText.trim(),
    });

    setInputText('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Account Switcher for multi-user chat verification */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus Messages
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real peer-to-peer conversations between students and lenders. Replies only appear when sent by the other user.
          </p>
        </div>

        {onSwitchDemoUser && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
            <span className="font-semibold text-blue-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Chatting as:
            </span>
            <span className="font-bold text-slate-900">
              {studentName || currentUser?.displayName || 'Student'}
            </span>
            <span className="text-blue-300">·</span>
            <button
              type="button"
              onClick={() => onSwitchDemoUser('lender')}
              className="cursor-pointer font-medium text-blue-700 hover:text-blue-900 underline"
              title="Log in as Rahul Sharma (Lender)"
            >
              Lender (Rahul)
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => onSwitchDemoUser('student')}
              className="cursor-pointer font-medium text-blue-700 hover:text-blue-900 underline"
              title="Log in as Ananya Sharma (Student)"
            >
              Student (Ananya)
            </button>
          </div>
        )}
      </div>

      {threads.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
          {/* Threads List Sidebar */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-white">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Conversations ({threads.length})
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {threads.map((thread) => {
                const isSelected = thread.key === (currentThread?.key || '');
                return (
                  <button
                    key={thread.key}
                    type="button"
                    onClick={() => setActiveKey(thread.key)}
                    className={`cursor-pointer w-full p-4 text-left transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                      {thread.peer.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {thread.peer}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {thread.lastMessage?.timestamp.split('at')[1] || ''}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 font-medium truncate mt-0.5">
                        {thread.itemTitle}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {thread.lastMessage?.message}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          {currentThread ? (
            <div className="md:col-span-8 flex flex-col h-full bg-white">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {currentThread.peer.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-none">
                      {currentThread.peer}
                    </h3>
                    <span className="text-xs text-slate-500 mt-1 inline-block">
                      Re: <strong className="text-blue-700">{currentThread.itemTitle}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Campus Verified</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#fbfcfd]">
                <div className="text-center my-2">
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    Direct conversation between {studentName || 'Student'} and {currentThread.peer}
                  </span>
                </div>

                {currentThread.messages.map((msg) => {
                  const isMine = isMessageFromMe(msg);
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {isMine ? 'You' : msg.sender}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                          isMine
                            ? 'bg-blue-700 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input: ONLY sends when user actually types and submits */}
              <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200 bg-white flex gap-2 items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Reply to ${currentThread.peer}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="cursor-pointer px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="md:col-span-8 flex items-center justify-center p-12 text-slate-400 text-xs">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No active chats yet</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            When you contact an item owner or receive inquiries regarding your listed gear, your conversation will appear here. No automatic replies are generated.
          </p>
          <button
            onClick={onBrowseClick}
            className="cursor-pointer mt-5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors"
          >
            Browse Campus Items
          </button>
        </div>
      )}
    </div>
  );
};
