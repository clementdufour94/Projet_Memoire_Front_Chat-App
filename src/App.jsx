import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const SOCKET_URL = 'http://localhost:3001'; // Assure-toi que l'URL correspond bien à ton serveur

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null); // ID de l'utilisateur courant
  const [receiverId, setReceiverId] = useState(2); // ID du destinataire
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Demander à l'utilisateur d'entrer son ID
    const enteredUserId = parseInt(prompt('Entrez votre ID utilisateur:'), 10);
    setUserId(enteredUserId);

    // Connexion à Socket.IO
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Joindre la room après avoir reçu l'ID utilisateur
    newSocket.emit('joinRoom', enteredUserId);

    newSocket.on('chatMessage', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      newSocket.off('chatMessage');
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Récupérer l'historique des messages lorsque receiverId change
    if (userId && receiverId) {
      fetch(`http://localhost:3001/api/messages/${userId}/${receiverId}`)
        .then((response) => response.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error('Erreur lors de la récupération des messages:', err));
    }
  }, [userId, receiverId]);

  const sendMessage = () => {
    if (message.trim() && socket && userId) {
      socket.emit('chatMessage', { senderId: userId, receiverId, message });
      setMessage('');
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index}>
              {msg.senderId === userId ? 'You' : `User ${msg.senderId}`} says: {msg.message}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
        <input
          type="number"
          value={receiverId}
          onChange={(e) => setReceiverId(parseInt(e.target.value, 10))}
          placeholder="Receiver ID"
        />
      </div>
    </div>
  );
}

export default App;
