export interface JobCategory {
  id: string;
  name: string;
  description: string;
  colorCode: string;
  iconName: string;
  fallbackImages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JobCategoryCreation {
  name: string;
  description: string;
  colorCode: string;
  iconName: string;
  fallbackImages: string[];
} 