export const ORDER_SORTING_OPTIONS = [
  {
    column_name: "Inventory ID",
    column_alias: "package.inventory_number",
    sort: "asc",
    is_desc: false
  },
  {
    column_name: "Inventory ID",
    column_alias: "package.inventory_number",
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
    column_alias: "package_type.name_en",
    sort: "asc",
    is_desc: false
  },
  {
    column_name: "Item Type",
    column_alias: "package_type.name_en",
    sort: "desc",
    is_desc: true
  }
];
