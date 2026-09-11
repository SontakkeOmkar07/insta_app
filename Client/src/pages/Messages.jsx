import React, { useEffect, useMemo, useState } from "react";
import { Search, Send } from "lucide-react";
import { useData } from "../context/DataCOntext";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/common/Avatar";
import { useNavigate } from "react-router-dom";

export const Messages = () => {
  const { users, messages = [], getConversation, createMessage } = useData();
  const { currentUser } = useAuth();
  const { showToast } = useData();
  const [activeUser, setActiveUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const otherUsers = useMemo(
    () => users.filter((user) => user.clerkId !== currentUser?.clerkId),
    [users, currentUser?.clerkId],
  );

  const filteredUsers = otherUsers.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase()),
  );

  const currentUserId = String(currentUser?.clerkId || "");
  const activeUserId = String(activeUser?.clerkId || activeUser?.id || "");

  const conversationMessages = messages.filter(
    (message) =>
      (String(message.senderId) === currentUserId &&
        String(message.receiverId) === activeUserId) ||
      (String(message.senderId) === activeUserId &&
        String(message.receiverId) === currentUserId),
  );

  useEffect(() => {
    if (!activeUserId) return;
    let cancelled = false;
    setIsLoading(true);
    getConversation(activeUserId)
      .catch((error) => console.error("Conversation load failed", error))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeUserId]);

  useEffect(() => {
    if (!activeUser && otherUsers.length > 0) setActiveUser(otherUsers[0]);
  }, [activeUser, otherUsers]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = messageText.trim();

    if (!text || !activeUserId) return;
    try {
      await createMessage(activeUserId, text);

      showToast("Message sent successfully", "success");

      setMessageText("");
    } catch (error) {
      console.error("Message send failed", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-0 sm:px-3 md:px-4 py-2 sm:py-4 h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]">
      <div className="bg-white dark:bg-neutral-900 border-y sm:border border-neutral-200 dark:border-neutral-800 sm:rounded-2xl h-full flex flex-col md:flex-row overflow-hidden shadow-sm sm:shadow-2xs">
        <aside className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-col shrink-0 max-h-[38%] md:max-h-none">
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
              Messages
            </h2>
          </div>
          <div className="p-2 sm:p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search people..."
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm sm:text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-0.5 sm:space-y-1">
            {filteredUsers.map((user) => (
              <button
                type="button"
                key={user.clerkId}
                onClick={() => setActiveUser(user)}
                className={`w-full flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-2.5 rounded-xl text-left transition-colors ${activeUser?.clerkId === user.clerkId
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40 active:bg-neutral-100 dark:active:bg-neutral-800"
                  }`}
              >
                <Avatar src={user.image || user.profileImage} size="md" />
                <span className="font-bold text-sm sm:text-xs text-neutral-900 dark:text-neutral-100 truncate">
                  @{user.username}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          {!activeUser ? (
            <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm px-4 text-center">
              Select someone to start chatting
            </div>
          ) : (
            <>
              <header className="px-3 sm:px-4 py-3 sm:py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5 sm:gap-3 shrink-0">
                <Avatar
                  src={activeUser.image || activeUser.profileImage}
                  size="sm"
                />
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                  @{activeUser.username}
                </span>
              </header>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 min-h-0">
                {isLoading && (
                  <p className="text-center text-xs text-neutral-400 py-2">
                    Loading messages...
                  </p>
                )}

                {conversationMessages.map((message) => {
                  const isMine = String(message.senderId) === currentUserId;
                  const story = message.storyPreview;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 text-sm sm:text-xs ${isMine
                            ? "bg-sky-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          }`}
                      >
                        {story?.mediaUrl && (
                          <div className="mb-2 overflow-hidden rounded-xl bg-black/10">
                            {story.type === "video" ? (
                              <video
                                src={story.mediaUrl}
                                muted
                                playsInline
                                preload="metadata"
                                className="max-h-24 sm:max-h-20 cursor-pointer w-full object-cover"
                                onClick={() =>
                                  navigate(`/stories/${currentUser.clerkId}`)
                                }
                              />
                            ) : (
                              <img
                                src={story.mediaUrl}
                                alt={story.caption || "Replied story"}
                                className="max-h-24 sm:max-h-20 cursor-pointer w-full object-cover"
                                onClick={() =>
                                  navigate(`/stories/${currentUser.clerkId}`)
                                }
                              />
                            )}
                            <p className="px-2 py-1 text-[10px] opacity-75">
                              {story.username
                                ? `@${story.username}'s story`
                                : "Story"}
                            </p>
                          </div>
                        )}
                        <p className="break-words">{message.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={sendMessage}
                className="p-2.5 sm:p-3 border-t border-neutral-200 dark:border-neutral-800 flex gap-2 shrink-0 safe-area-pb"
              >
                <input
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 min-w-0 px-3.5 py-2.5 sm:py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm sm:text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2.5 sm:p-2 rounded-xl bg-sky-500 text-white disabled:opacity-40 shrink-0 active:scale-95 transition-transform"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
};