import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Badge,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  Card,
  CardMedia,
  CardContent,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  AttachFile as AttachIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { chatAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  product_id?: string;
  product_data?: {
    id: string;
    title: string;
    price: number;
    image?: string;
  };
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  other_user: {
    id: string;
    full_name: string;
    avatar?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
  };
  unread_count: number;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatIdFromUrl = searchParams.get('chat');

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(chatIdFromUrl);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data);

      // If no chat selected but we have conversations, select the first one
      if (!selectedChat && response.data.length > 0) {
        setSelectedChat(response.data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки чатов');
    } finally {
      setLoading(false);
    }
  }, [selectedChat]);

  const loadMessages = useCallback(async (chatId: string, limit = 50, offset = 0) => {
    setLoadingMessages(true);
    setError('');
    try {
      const response = await chatAPI.getMessages(chatId, limit, offset);
      setMessages(response.data);
      scrollToBottom();

      // Mark all messages as read
      const unreadMessages = response.data.filter(
        (msg: Message) => !msg.is_read && msg.sender_id !== user?.id
      );
      for (const msg of unreadMessages) {
        await chatAPI.markMessageRead(msg.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки сообщений');
    } finally {
      setLoadingMessages(false);
    }
  }, [user?.id]);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('access_token');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    socketRef.current = io(API_URL, {
      auth: { token },
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('new_message', (message: Message) => {
      // Add new message to the chat
      if (message.chat_id === selectedChat) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();

        // Mark as read
        chatAPI.markMessageRead(message.id);
      }

      // Update conversation list
      loadConversations();
    });

    socketRef.current.on('message_read', ({ messageId, chatId }: any) => {
      // Update message read status
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg))
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isAuthenticated, selectedChat, loadConversations, navigate]);

  // Load conversations
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, loadConversations]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    setError('');

    try {
      const messageData = {
        chat_id: selectedChat,
        content: newMessage.trim(),
      };

      await chatAPI.sendMessage(messageData);
      setNewMessage('');
      scrollToBottom();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations.find((c) => c.id === selectedChat);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Главная
        </MuiLink>
        <Typography color="text.primary">Сообщения</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
        Сообщения
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 'calc(100vh - 250px)', display: 'flex' }}>
        {/* Conversations List */}
        <Box
          sx={{
            width: 320,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search */}
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Divider />

          {/* Conversations */}
          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {filteredConversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'Ничего не найдено' : 'Нет диалогов'}
                </Typography>
              </Box>
            ) : (
              filteredConversations.map((conv) => (
                <ListItem key={conv.id} disablePadding>
                  <ListItemButton
                    selected={selectedChat === conv.id}
                    onClick={() => setSelectedChat(conv.id)}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conv.unread_count}
                        color="primary"
                        overlap="circular"
                      >
                        <Avatar src={conv.other_user.avatar} alt={conv.other_user.full_name}>
                          {conv.other_user.full_name[0]}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={conv.other_user.full_name}
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ fontWeight: conv.unread_count > 0 ? 600 : 400 }}
                        >
                          {conv.last_message?.content || 'Нет сообщений'}
                        </Typography>
                      }
                    />
                    {conv.last_message && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(conv.last_message.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    )}
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Box>

        {/* Messages Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedChat && currentConversation ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={currentConversation.other_user.avatar}
                    alt={currentConversation.other_user.full_name}
                  >
                    {currentConversation.other_user.full_name[0]}
                  </Avatar>
                  <Typography variant="h6">{currentConversation.other_user.full_name}</Typography>
                </Box>
                <IconButton>
                  <MoreIcon />
                </IconButton>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {loadingMessages ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Нет сообщений
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id;

                      return (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            justifyContent: isOwn ? 'flex-end' : 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Box sx={{ maxWidth: '70%' }}>
                            {/* Product attachment */}
                            {message.product_data && (
                              <Card
                                sx={{ mb: 1, cursor: 'pointer' }}
                                onClick={() => navigate(`/products/${message.product_data?.id}`)}
                              >
                                <Box sx={{ display: 'flex', p: 1 }}>
                                  <CardMedia
                                    component="img"
                                    sx={{ width: 80, height: 80, objectFit: 'cover' }}
                                    image={message.product_data.image || '/placeholder.png'}
                                    alt={message.product_data.title}
                                  />
                                  <CardContent sx={{ flex: 1, py: 1, px: 2 }}>
                                    <Typography variant="body2" noWrap>
                                      {message.product_data.title}
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                      {message.product_data.price} сом
                                    </Typography>
                                  </CardContent>
                                </Box>
                              </Card>
                            )}

                            {/* Message bubble */}
                            <Paper
                              sx={{
                                p: 1.5,
                                bgcolor: isOwn ? 'primary.main' : 'grey.100',
                                color: isOwn ? 'white' : 'text.primary',
                              }}
                            >
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {message.content}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  mt: 0.5,
                                  textAlign: 'right',
                                  color: isOwn ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                }}
                              >
                                {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {isOwn && (message.is_read ? ' ✓✓' : ' ✓')}
                              </Typography>
                            </Paper>
                          </Box>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton>
                    <AttachIcon />
                  </IconButton>
                  <TextField
                    fullWidth
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    multiline
                    maxRows={4}
                    disabled={sending}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? <CircularProgress size={24} /> : <SendIcon />}
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Выберите диалог
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatPage;
