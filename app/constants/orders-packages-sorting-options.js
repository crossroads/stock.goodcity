export const ORDERS_PACKAGES_SORTING_OPTIONS = [
  {
    column_name: "Inventory ID",
    column_alias: "packages.inventory_number",
    sort: "asc",
    is_desc: false
  },
  {
    column_name: "Inventory ID",
    column_alias: "packages.inventory_number",
    sort: "desc",
    is_desc: true
  },
  {
    column_name: "Added Date",
    column_alias: "orders_packages.created_at",
    sort: "asc",
    is_desc: false
  },
  {
    column_name: "Added Date",
    column_alias: "orders_packages.created_at",
    sort: "desc",
    is_desc: true
  },
  {
    column_name: "Item Type",
    column_alias: "package_types.name_en",
    sort: "asc",
    is_desc: false
  },
  {
    column_name: "Item Type",
    column_alias: "package_types.name_en",
    sort: "desc",
    is_desc: true
  }
];

export const ORDER_PACKAGES_STATES = [
  { state: "designated", enabled: false },
  { state: "dispatched", enabled: false },
  { state: "cancelled", enabled: false }
];
