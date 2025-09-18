export interface BroadcastMessageDTO {
  title: string;
  message: string;
  url?: string;
  emojiIcon?: string;
  targetUserIds?: string[];
}
