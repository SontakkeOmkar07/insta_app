import  { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserCard } from '../components/users/UserCard';
import { Search as SearchIcon, X, History, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Search = () => {
  const { users } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'omkar_s',
    'priya_m',
    'rahul_k',
  ]);

  const handleUserClick = (username) => {
    if (!recentSearches.includes(username)) {
      setRecentSearches([username, ...recentSearches.slice(0, 4)]);
    }
    navigate(`/profile/${username}`);
  };

  const removeRecent = (item) => {
    setRecentSearches(recentSearches.filter((s) => s !== item));
  };

  const filteredUsers = query.trim()
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.fullName.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search accounts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-3.5 p-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Recent Searches
            </span>
            <button
              onClick={() => setRecentSearches([])}
              className="text-xs font-bold text-sky-500 hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
              >
                <span
                  onClick={() => handleUserClick(item)}
                  className="cursor-pointer hover:underline"
                >
                  @{item}
                </span>
                <button
                  onClick={() => removeRecent(item)}
                  className="p-0.5 hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results or Suggested Accounts */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {query ? 'Search Results' : 'Suggested Accounts'}
        </span>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2 divide-y divide-neutral-100 dark:divide-neutral-800">
          {filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-xs text-neutral-400">No accounts match "{query}"</p>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={() => handleUserClick(user.username)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};