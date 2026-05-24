import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ChatbotWidget from './components/ChatbotWidget';


function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <LandingPage onOpenChat={() => setIsChatOpen(true)} />
      <ChatbotWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {!isChatOpen && (
        <button 
          className="chat-button" 
          onClick={() => setIsChatOpen(true)}
          aria-label="Open chat"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
          </svg>
        </button>
      )}
    </>
  );
}

export default App;
