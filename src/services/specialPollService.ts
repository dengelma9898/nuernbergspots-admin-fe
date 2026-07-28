import { useMemo } from 'react';

import {
  SpecialPoll,
  CreateSpecialPollDto,
  UpdateSpecialPollStatusDto,
  UpdateSpecialPollHighlightDto,
  SpecialPollResponse,
} from '@/models/specialPoll';

import { endpoints, useApi } from '../lib/api';

export interface GetSpecialPollsOptions {
  highlighted?: boolean;
}

export function useSpecialPollService() {
  const api = useApi();

  return useMemo(
    () => ({
      getSpecialPolls: async (options?: GetSpecialPollsOptions): Promise<SpecialPoll[]> => {
        return api.getData<SpecialPoll[]>(
          endpoints.specialPolls({ highlighted: options?.highlighted })
        );
      },
      getSpecialPoll: async (id: string): Promise<SpecialPoll> => {
        return api.getData<SpecialPoll>(endpoints.specialPollById(id));
      },
      createSpecialPoll: async (data: CreateSpecialPollDto): Promise<SpecialPoll> => {
        return api.postData<SpecialPoll>(endpoints.specialPolls(), data);
      },
      updateSpecialPollStatus: async (
        id: string,
        data: UpdateSpecialPollStatusDto
      ): Promise<SpecialPoll> => {
        return api.patchData<SpecialPoll>(`${endpoints.specialPollById(id)}/status`, data);
      },
      updateSpecialPollHighlight: async (
        id: string,
        data: UpdateSpecialPollHighlightDto
      ): Promise<SpecialPoll> => {
        return api.patchData<SpecialPoll>(endpoints.specialPollHighlight(id), data);
      },
      addResponse: async (id: string, responseText: string): Promise<SpecialPoll> => {
        return api.postData<SpecialPoll>(`${endpoints.specialPollById(id)}/responses`, {
          response: responseText,
        });
      },
      removeResponse: async (id: string): Promise<SpecialPoll> => {
        return api.deleteData<SpecialPoll>(endpoints.specialPollResponsesMe(id));
      },
      removeSpecialPoll: async (id: string): Promise<void> => {
        await api.delete(endpoints.specialPollById(id));
      },
      updateResponses: async (
        id: string,
        responses: SpecialPollResponse[]
      ): Promise<SpecialPoll> => {
        return api.patchData<SpecialPoll>(`${endpoints.specialPollById(id)}/responses`, {
          responses,
        });
      },
      upvoteResponse: async (pollId: string, responseId: string): Promise<SpecialPoll> => {
        return api.postData<SpecialPoll>(
          endpoints.specialPollResponseUpvote(pollId, responseId),
          {}
        );
      },
    }),
    [api]
  );
}
