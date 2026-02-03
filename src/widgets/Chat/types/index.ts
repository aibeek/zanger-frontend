export interface User {
  id: string
  name: string
  avatar?: string
  role: 'client' | 'lawyer'
}

export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  timestamp: Date
  isRead: boolean
  status: MessageStatus
  type: 'text' | 'voice' | 'file'
}

export interface Chat {
  id: string
  client: User
  lawyer: User
  applicationTitle: string
  lastMessage?: Message
  unreadCount: number
  lastActivity: Date
  messages: Message[]
  hasMore?: boolean
  oldestId?: string
  newestId?: string
}

export interface ChatListProps {
  chats: Chat[]
  selectedChatId?: string
  onChatSelect: (chatId: string) => void
}

export interface ChatWindowProps {
  chat?: Chat
  currentUserId: string
  onSendMessage: (content: string) => void
  onLoadMore?: () => Promise<void>
  isLoadingMore?: boolean
  hasMore?: boolean
  onBack?: () => void
}

// WebSocket event types
export interface MessageSentEvent {
  id: number
  chat_id: number
  sender_id: number
  content: string
  status: MessageStatus
  is_read: boolean
  created_at: string
  sender: {
    id: number
    name: string
    avatar?: string
  } | null
}

export interface MessageReadEvent {
  chat_id: number
  reader_id: number
  message_ids: number[]
  read_at: string
}