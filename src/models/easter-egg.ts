export interface EasterEggLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface EasterEgg {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  prizeDescription?: string;
  numberOfWinners: number;
  startDate: string;
  endDate?: string;
  location: EasterEggLocation;
  participantCount: number;
  winnerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEasterEggDto {
  title: string;
  description: string;
  prizeDescription?: string;
  numberOfWinners: number;
  startDate: string;
  endDate?: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface UpdateEasterEggDto {
  title?: string;
  description?: string;
  prizeDescription?: string;
  numberOfWinners?: number;
  startDate?: string;
  endDate?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddWinnerDto {
  userId: string;
}

export interface EasterEggFeatureStatus {
  isFeatureActive: boolean;
  startDate?: string;
}

export interface ParticipantPerEgg {
  eggId: string;
  title: string;
  participantCount: number;
  winnerCount: number;
}

export interface EasterEggStatistics {
  totalEggs: number;
  activeEggs: number;
  totalParticipants: number;
  totalWinners: number;
  participantsPerEgg: ParticipantPerEgg[];
}
