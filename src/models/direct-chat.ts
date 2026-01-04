/**
 * Settings für das Direkte Chats Feature
 */
export interface IDirectChatSettings {
  /** Ob das Feature aktiviert ist */
  isEnabled: boolean;
  /** Wann die Settings zuletzt aktualisiert wurden */
  updatedAt?: string;
  /** Wer die Settings zuletzt aktualisiert hat */
  updatedBy?: string;
}

/**
 * DTO zum Aktualisieren der DirectChat-Settings
 */
export interface IUpdateDirectChatSettingsDto {
  isEnabled: boolean;
}

