import { Keyword } from './keyword';

export interface BusinessCategoryCreation {
  name: string;
  iconName: string;
  description: string;
  keywordIds?: string[];
} 

export interface BusinessCategory {
    id: string;
    name: string;
    iconName: string;
    description: string;
    keywords: Keyword[];
    createdAt: string;
    updatedAt: string;
  } 