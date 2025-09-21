export interface User {
  id: string
  name: string
  avatar?: string
  role: 'client' | 'lawyer'
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  timestamp: Date
  isRead: boolean
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
  onBack?: () => void
}