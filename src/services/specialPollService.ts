import { useApi, endpoints } from '../lib/api';
import { ApiResponse, unwrapData } from '../lib/apiUtils';
import { useMemo } from 'react';
import { SpecialPoll, SpecialPollStatus, CreateSpecialPollDto, UpdateSpecialPollStatusDto, UpdateSpecialPollResponsesDto, SpecialPollResponse } from '@/models/specialPoll';

export function useSpecialPollService() {
  const api = useApi();

  return useMemo(() => ({
    getSpecialPolls: async (): Promise<SpecialPoll[]> => {
      const response = await api.get<ApiResponse<SpecialPoll[]>>(endpoints.specialPolls);
      return unwrapData(response);
    },
    getSpecialPoll: async (id: string): Promise<SpecialPoll> => {
      const response = await api.get<ApiResponse<SpecialPoll>>(endpoints.specialPollById(id));
      return unwrapData(response);
    },
    createSpecialPoll: async (data: CreateSpecialPollDto): Promise<SpecialPoll> => {
      const response = await api.post<ApiResponse<SpecialPoll>>(endpoints.specialPolls, data);
      return unwrapData(response);
    },
    updateSpecialPollStatus: async (id: string, data: UpdateSpecialPollStatusDto): Promise<SpecialPoll> => {
      const response = await api.patch<ApiResponse<SpecialPoll>>(`${endpoints.specialPollById(id)}/status`, data);
      return unwrapData(response);
    },
    addResponse: async (id: string, responseText: string): Promise<SpecialPoll> => {
      const response = await api.post<ApiResponse<SpecialPoll>>(`${endpoints.specialPollById(id)}/responses`, { response: responseText });
      return unwrapData(response);
    },
    removeResponse: async (id: string): Promise<SpecialPoll> => {
      const response = await api.delete<ApiResponse<SpecialPoll>>(`${endpoints.specialPollById(id)}/responses`);
      return unwrapData(response);
    },
    removeSpecialPoll: async (id: string): Promise<void> => {
      await api.delete(endpoints.specialPollById(id));
    },
    updateResponses: async (id: string, responses: SpecialPollResponse[]): Promise<SpecialPoll> => {
      const response = await api.patch<ApiResponse<SpecialPoll>>(
        `${endpoints.specialPollById(id)}/responses`,
        { responses }
      );
      return unwrapData(response);
    },
  }), [api]);
} 