

import { useAppContext } from '@/context/AppContext';
import { assets } from '../assets/assets';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PromptBox = ({ setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  } = useAppContext();

  // ✅ Auto-select first chat if none selected
  useEffect(() => {
    if (!selectedChat && chats.length > 0) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat, setSelectedChat]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    const promptCopy = prompt;

    try {
      e.preventDefault();

      if (!user) return toast.error('Login to send message');
      if (!selectedChat || !selectedChat._id) return toast.error('No chat selected');
      if (isLoading) return toast.error('Wait for the previous prompt response');

      setIsLoading(true);
      setPrompt('');

      const userMessage = {
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
      };

      // Update chats state
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, messages: [...chat.messages, userMessage] }
            : chat
        )
      );

      // Update selectedChat state
      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      // ✅ Send prompt to backend
      const { data } = await axios.post('/api/chat/ai', {
        chatId: selectedChat._id,
        prompt,
      });

      if (data.success) {
        const assistantResponse = data.data;

        // Update chats with assistant response
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, messages: [...chat.messages, assistantResponse] }
              : chat
          )
        );

        // Animate assistant response
        const messageTokens = assistantResponse.content.split(' ');
        let assistantMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };

        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));

        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            assistantMessage.content = messageTokens.slice(0, i + 1).join(' ');
            setSelectedChat((prev) => {
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                assistantMessage,
              ];
              return { ...prev, messages: updatedMessages };
            });
          }, i * 50);
        }
      } else {
        toast.error(data.message || 'Something went wrong');
        setPrompt(promptCopy);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ No chat selected fallback UI
  if (!selectedChat) {
    return (
      <div className="text-gray-400 text-sm text-center mt-6">
        Please select or create a chat to start messaging.
      </div>
    );
  }

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${selectedChat?.messages?.length > 0 ? "max-w-3xl" : "max-w-2xl"}  bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className="flex items-center justify-between text-sm mt-2">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image src={assets.deepthink_icon} alt="" />
            DeepThink (R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image src={assets.search_icon} alt="" />
            Search
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
          <button
            type="submit"
            className={`${
              prompt ? 'bg-primary' : 'bg-[#71717a]'
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt="Send"
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
