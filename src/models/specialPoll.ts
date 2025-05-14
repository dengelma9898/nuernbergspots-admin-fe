export enum SpecialPollStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export interface SpecialPollResponse {
  userId: string;
  userName: string;
  response: string;
  createdAt: string;
}

export interface SpecialPoll {
  id: string;
  title: string;
  responses: SpecialPollResponse[];
  status: SpecialPollStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialPollDto {
  title: string;
}

export interface UpdateSpecialPollStatusDto {
  status: SpecialPollStatus;
}

export interface UpdateSpecialPollResponsesDto {
  responses: SpecialPollResponse[];
} 