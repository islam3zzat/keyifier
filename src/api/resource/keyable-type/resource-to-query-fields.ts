export enum KeyableResourceType {
  Product = "product",
  ProductAsset = "productAsset",
  ProductVariant = "productVariant",
  ProductPrice = "productPrice",

  Category = "category",
  CategoryAsset = "categoryAsset",
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

const resourceToQueryField = (type: KeyableResourceType) => {
  switch (type) {
    case KeyableResourceType.Product:
    case KeyableResourceType.ProductAsset:
    case KeyableResourceType.ProductVariant:
    case KeyableResourceType.ProductPrice:
      return {
        queryName: "ProductsQuery",
        queryField: "products",
        mutationName: "updateProduct",
        actionTypeName: "ProductUpdateAction",
      };
    case KeyableResourceType.Category:
    case KeyableResourceType.CategoryAsset:
      return {
        queryName: "CategoriesQuery",
        queryField: "categories",
        mutationName: "updateCategory",
        actionTypeName: "CategoryUpdateAction",
      };
    case KeyableResourceType.DiscountCode:
      return {
        queryName: "DiscountCodesQuery",
        queryField: "discountCodes",
        mutationName: "updateDiscountCode",
        actionTypeName: "DiscountCodeUpdateAction",
      };
    case KeyableResourceType.CartDiscount:
      return {
        queryName: "CartDiscountsQuery",
        queryField: "cartDiscounts",
        mutationName: "updateCartDiscount",
        actionTypeName: "CartDiscountUpdateAction",
      };
    case KeyableResourceType.CustomerGroup:
      return {
        queryName: "CustomerGroupsQuery",
        queryField: "customerGroups",
        mutationName: "updateCustomerGroup",
        actionTypeName: "CustomerGroupUpdateAction",
      };
    case KeyableResourceType.Customer:
      return {
        queryName: "CustomersQuery",
        queryField: "customers",
        mutationName: "updateCustomer",
        actionTypeName: "CustomerUpdateAction",
      };
    case KeyableResourceType.ProductType:
      return {
        queryName: "ProductTypesQuery",
        queryField: "productTypes",
        mutationName: "updateProductType",
        actionTypeName: "ProductTypeUpdateAction",
      };
    case KeyableResourceType.StandalonePrice:
      return {
        queryName: "StandalonePricesQuery",
        queryField: "standalonePrices",
        mutationName: "updateStandalonePrice",
        actionTypeName: "StandalonePriceUpdateAction",
      };
    case KeyableResourceType.TaxCategory:
      return {
        queryName: "TaxCategoriesQuery",
        queryField: "taxCategories",
        mutationName: "updateTaxCategory",
        actionTypeName: "TaxCategoryUpdateAction",
      };
  }
};

function assertValidResourceType(resourceType: any): never {
  throw new Error(`Unknown resource type: ${resourceType}`);
}

export const resourceToQueryFields = (
  resourceType: KeyableResourceType
): ResourceQueryFields => {
  const fields = resourceToQueryField(resourceType);
  if (!fields) assertValidResourceType(resourceType);

  return fields;
};
