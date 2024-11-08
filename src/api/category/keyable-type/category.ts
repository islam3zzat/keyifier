import { Category } from "@commercetools/platform-sdk";
import { keylessPredicate } from "../../resource/predicate.js";

export const keylessCategoriesPredicate = keylessPredicate;

export const categoriesQuery = `query CategoriesQuery($predicate: String!) {
    categories(where: $predicate, sort: "id asc", limit: 500) {
      total
      results {
        id
        version
      }
    }
  }
`;

export const getNextCategoryKey = (id: string) => {
  const prefix = "category_v1002";
  return `${prefix}_${id}`;
};

const getCategoryActions = (id: string) => {
  const key = getNextCategoryKey(id);
  const actions = [
    {
      setKey: {
        key,
      },
    },
  ];

  return [actions];
};

export const categoryToActionBatches = (category: Category) => {
  return getCategoryActions(category.id);
};
