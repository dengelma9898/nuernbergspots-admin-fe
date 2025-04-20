export interface EventCategory {
  id: string;
  name: string;
  description: string;
  colorCode: string;
  iconName: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventCategoryCreation {
  name: string;
  description: string;
  colorCode: string;
  iconName: string;
} 