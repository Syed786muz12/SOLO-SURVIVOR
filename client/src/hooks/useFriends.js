import { useState } from 'react';
import { ref, get } from 'firebase/database';
import { rtdb as database } from '../services/firebase';

export default function useFriends() {
  const [friends, setFriends] = useState([]);
  const [requestsSent, setRequestsSent] = useState([]);
  const [requestsReceived] = useState([]); // Placeholder for received requests
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = async (id) => {
    try {
      const snapshot = await get(ref(database, `players/${id}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSearchResult(data);
        return data;
      } else {
        setSearchResult(null);
        return null;
      }
    } catch (error) {
      console.error("Search error:", error);
      return null;
    }
  };

  const handleFriendRequest = (action, id) => {
    if (action === 'add') {
      if (!requestsSent.includes(id)) {
        setRequestsSent((prev) => [...prev, id]);
      }
    } else if (action === 'remove') {
      setFriends((prev) => prev.filter(f => f.id !== id));
    }
  };

  return {
    friends,
    requestsSent,
    requestsReceived,
    searchId,
    setSearchId,
    searchResult,
    setSearchResult,
    handleSearch,
    handleFriendRequest
  };
}
