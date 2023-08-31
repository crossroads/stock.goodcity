export const ORDERS_PACKAGES_SORTING_OPTIONS = Object.freeze(
  [
    {
      column_name: "Added Date",
      column_alias: "orders_packages.created_at",
      sort: "desc"
    },
    {
      column_name: "Added Date",
      column_alias: "orders_packages.created_at",
      sort: "asc"
    },
    {
      column_name: "Order ID",
      column_alias: "orders_packages.order_id",
      sort: "asc"
    },
    {
      column_name: "Order ID",
      column_alias: "orders_packages.order_id",
      sort: "desc"
    },
    {
      column_name: "Inventory ID",
      column_alias: "packages.inventory_number",
      sort: "asc"
    },
    {
      column_name: "Inventory ID",
      column_alias: "packages.inventory_number",
      sort: "desc"
    },
    {
      column_name: "Item Type",
      column_alias: "package_types.name_en",
      sort: "asc"
    },
    {
      column_name: "Item Type",
      column_alias: "package_types.name_en",
      sort: "desc"
    }
  ].map(Object.freeze)
);

export const ORDERS_PACKAGES_STATES = Object.freeze(
  [
    { state: "designated", enabled: false },
    { state: "dispatched", enabled: false },
    { state: "cancelled", enabled: false }
  ].map(Object.freeze)
);
