export interface Chatroom {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdBy: string;
  participants: string[];
  lastMessage?: {
    content: string;
    authorId: string;
    sentAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatroomDto {
  title: string;
  description: string;
  imageUrl?: string;
  participants: string[];
}

export interface UpdateChatroomDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  participants?: string[];
} 