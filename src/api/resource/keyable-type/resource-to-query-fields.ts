export enum KeyableResourceType {
  Product = "product",
  Category = "category",
  DiscountCode = "discountCode",
  CartDiscount = "cartDiscount",
  CustomerGroup = "customerGroup",
  Customer = "customer",
  ProductType = "productType",
  StandalonePrice = "standalonePrice",
  TaxCategory = "taxCategory",
}

interface ResourceQueryFields {
  queryName: string;
  queryField: string;
  mutationName: string;
  actionTypeName: string;
}

const resourceQueryFieldMap: Record<KeyableResourceType, ResourceQueryFields> =
  {
    [KeyableResourceType.Product]: {
      queryName: "ProductsQuery",
      queryField: "products",
      mutationName: "updateProduct",
      actionTypeName: "ProductUpdateAction",
    },
    [KeyableResourceType.Category]: {
      queryName: "CategoriesQuery",
      queryField: "categories",
      mutationName: "updateCategory",
      actionTypeName: "CategoryUpdateAction",
    },
    [KeyableResourceType.DiscountCode]: {
      queryName: "DiscountCodesQuery",
      queryField: "discountCodes",
      mutationName: "updateDiscountCode",
      actionTypeName: "DiscountCodeUpdateAction",
    },
    [KeyableResourceType.CartDiscount]: {
      queryName: "CartDiscountsQuery",
      queryField: "cartDiscounts",
      mutationName: "updateCartDiscount",
      actionTypeName: "CartDiscountUpdateAction",
    },
    [KeyableResourceType.CustomerGroup]: {
      queryName: "CustomerGroupsQuery",
      queryField: "customerGroups",
      mutationName: "updateCustomerGroup",
      actionTypeName: "CustomerGroupUpdateAction",
    },
    [KeyableResourceType.Customer]: {
      queryName: "CustomersQuery",
      queryField: "customers",
      mutationName: "updateCustomer",
      actionTypeName: "CustomerUpdateAction",
    },
    [KeyableResourceType.ProductType]: {
      queryName: "ProductTypesQuery",
      queryField: "productTypes",
      mutationName: "updateProductType",
      actionTypeName: "ProductTypeUpdateAction",
    },
    [KeyableResourceType.StandalonePrice]: {
      queryName: "StandalonePricesQuery",
      queryField: "standalonePrices",
      mutationName: "updateStandalonePrice",
      actionTypeName: "StandalonePriceUpdateAction",
    },
    [KeyableResourceType.TaxCategory]: {
      queryName: "TaxCategoriesQuery",
      queryField: "taxCategories",
      mutationName: "updateTaxCategory",
      actionTypeName: "TaxCategoryUpdateAction",
    },
  };

function assertValidResourceType(resourceType: any): never {
  throw new Error(`Unknown resource type: ${resourceType}`);
}

export const resourceToQueryFields = (
  resourceType: KeyableResourceType
): ResourceQueryFields => {
  const fields = resourceQueryFieldMap[resourceType];
  if (!fields) assertValidResourceType(resourceType);

  return fields;
};
