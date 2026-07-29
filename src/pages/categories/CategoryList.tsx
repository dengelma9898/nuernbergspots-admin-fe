import { useCategoryList } from '@/hooks/useCategoryList';
import { CategoryListContent } from '@/components/categories/CategoryListContent';

export function CategoryList() {
  const categoryList = useCategoryList();
  return <CategoryListContent {...categoryList} />;
}
