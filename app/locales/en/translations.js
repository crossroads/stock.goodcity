export default {
  offline_error:
    "Unable to complete action, please check your internet connection.",
  unexpected_error: "Something went wrong",
  okay: "Okay",
  "language.en": "English",
  "language.zh": "中文",
  switch_language: "Switch language",
  add_inventory_item: "Add item to inventory",
  loading: "Loading...",
  loading_timeout_error: "Loading view timeout reached.",
  loading_timeout: "This is taking too long! Click okay to reload.",
  back: "Back",
  search: "Search",
  state: "State",
  label: "Label",
  location: "Location",
  in_stock: "In Stock",
  confirm: "Confirm",
  QuotaExceededError:
    "Site may not work in Safari's <b>private mode.</b> Please try</br><ul><li><a href='https://itunes.apple.com/in/app/goodcitystock.hk/id1144806764?mt=8' style='color: black!important; background-color: #dee4eb !important;'>Downloading the iOS App</a></li><li>Using regular (not private) mode in Safari</li><li>Using Chrome's private browsing mode</li></ul>",
  search_min: "Search (min 3 characters)",
  no_search_results: "No Search Results.",
  cancel: "Cancel",
  ok: "OK",
  done: "Done",
  orders_in_process: "Orders In Process",
  search_no_results: "Sorry, No results found.",
  version: "Stock v.",
  organisation_title: "Organisation",
  add: "+Add",
  save: "Save",
  details: "Details",
  orders: "Orders",
  users_count: "Users",
  menu: "Menu",
  manage_system: "Manage System",
  new_item_menu: "Create New Inventory Item",
  new_order_menu: "Create New Order",
  search_organisation: "Search Organisation",
  not_now: "Not Now",
  close: "Close",
  incomplete_form: "Please fill in the required fields to continue",
  continue: "Continue",
  show: "Show",
  save_changes: "Save changes",
  discard: "Discard",
  discard_changes: "Discard changes",
  manage_charity_users: "Manage charity users",
  create_new_item: "+Item",
  create_new_box: "+Multi-Item Box",
  create_new_pallet: "+Multi-Item Pallet",
  manage_inventory: "Quotas",
  manage_users: "Manage Users",
  search_user: "Search User",
  new_order: "+ HK Orders",
  full_name: "{{firstName}} {{lastName}}",
  mobile_prefix: "+852",
  not_found:
    "Oooops, the location you're headed to doesn't seem to exist anymore. Sorry!",
  unavailable_item: "Sorry! This item is not available.",
  unavailable_order: "Sorry! This order is not available.",
  yes: "Yes",
  no: "No",
  stocktakes: {
    title: "Stocktakes",
    create_new: "Create New Stocktake",
    confirm_create: "Create Stocktake",
    select_location: "Select a location to stocktake",
    name: "Name",
    location: "Location",
    comment: "Comment",
    saving: "Saving changes...",
    save_error: "An error occured. Some changes were not applied",
    try_again: "Try again",
    expected_qty: "Expected Qty",
    recorded_change: "Recorded Change",
    requires_recount: "Requires (re)count.",
    confirm_count: "Confirm count is {{count}}",
    over: "Over",
    under: "Under",
    add_item: "Add Item",
    scanning_failure: "Failed to launch the scanner",
    scanner_mode: "Scanner Mode",
    stop_scanning: "STOP Scanning",
    commit_stocktake: "Commit Stocktake",
    cancel_stocktake: "Cancel Stocktake",
    only_show_variances: "Only show variances",
    only_show_warnings: "Only show warnings",
    unknown_inventory_number: "Inventory code {{code}} not found",
    confirm_cancel: "This stocktake will be cancelled. Are you sure ?",
    tips: {
      start_counting: "Items you count will appear here",
      review_tab:
        "Head over to the 'Review' tab to see the full list of expected items"
    },
    errors: {
      name_exists: "Another stocktake with the same name already exists",
      stocktake_exists_for_location:
        "Warning: A stocktake already exists for this location"
    },
    states: {
      open: "Open",
      closed: "Closed",
      cancelled: "Cancelled"
    },
    detail_tabs: {
      count: "Count",
      review: "Review"
    },
    counts: {
      counted: "Counted",
      gains: "Gains",
      losses: "Losses",
      warnings: "Warnings"
    }
  },
  box_pallet: {
    indicate_amount:
      "Indicate how many are you taking from each of the locations below.",
    available: "Available",
    location: "Location",
    quantity: "Quantity",
    number_to_move: "Number to move",
    move_to: "Move item to",
    move: "Move",
    not_now: "Not Now",
    add_to: "Add item to",
    remove: "Remove",
    content: "content",
    details: "details",
    bad_item: "Bad item",
    invalid_quantity:
      "Added quantity cannot be greater than the available quantity for each location.",
    type_to_search: "Type in to search items to add.",
    cannot_change_type:
      "Cannot change type of a box with items. Please remove the items and try again"
  },
  messages: {
    you: "You",
    chat_note: "Chat about this order with the user",
    item_chat_permission_error:
      "You are not authorized to send messages on items.",
    send: "Send",
    day: {
      today: "Today",
      morning: "Morning",
      afternoon: "Afternoon"
    }
  },
  camera_scan: {
    permission_error: "Camera permission is not turned on."
  },
  weekday_1: "Monday",
  weekday_2: "Tuesday",
  weekday_3: "Wednesday",
  weekday_4: "Thursday",
  weekday_5: "Friday",
  weekday_6: "Saturday",
  weekday_7: "Sunday",
  online_status: {
    online: "Online",
    not_connected: "Not Connected"
  },
  order_cancellation_reason: {
    warning: "This will remove any items from the order and cancel the order",
    title: "Cancellation Reasons",
    other: "Other",
    reason_count: "{{count}} remaining"
  },
  order_client_summary: {
    remove_client_title: "Remove Client",
    remove_client_info: "Remove client/beneficiary",
    client_name: "Client's Name",
    client_phone: "Client's Phone",
    id_title: "Type of id held",
    id_number: "ID Number",
    no_client: "No client",
    add_beneficiary: "Add client/beneficiary",
    request_purpose: "Request Purpose",
    number_benefiting: "Number benefiting",
    primary_location: "Primary location",
    description_of_need: "Description of need",
    description_error: "Description is required",
    people_helped_error: "Number is required"
  },
  order_contact_summary: {
    change_contact: "Change Contact",
    choose_different_contact: "Choose different contact",
    organisation_title: "Organisation",
    contact_name: "Name",
    contact_phone: "Phone",
    preferred_contact_number: "Preferred contact number",
    contact_position: "Position",
    contact_email: "Email",
    contact_last_seen: "Last seen",
    contact_registered: "Registered",
    submitted_by: "Submitted By",
    total_requests: "Total requests",
    country: "Country",
    shipment_number: "Shipment number",
    people_helped: "Number benefiting",
    description: "Description of need",
    approval_status: "Approval status",
    approval_directions: `Please review the contact before processing their order. If they are eligible to request goods on behalf of the selected organisation “Authorize” them. If not, “Deny”`,
    approve: "Approve",
    deny: "Deny",
    status_approved: "Approved",
    status_pending: "Pending",
    status_denied: "Denied",
    status_expired: "Expired"
  },
  order_tabs: {
    summary: "Summary",
    goods: "Goods",
    logistics: "Logistics",
    staff: "Staff",
    user: "User"
  },
  order_summary_tabs: {
    contact: "Contact",
    client: "Purpose/Client"
  },
  authenticate: {
    input_code: "Input Code"
  },
  _resend: {
    no_sms: "Haven't received SMS code?",
    please_wait: "Please wait 5 minutes...",
    resend: "Resend"
  },
  _verification_pin: {
    input_code: "Input 4-digit SMS code we just sent you:",
    auth_error: "Sorry! Please enter the correct pin."
  },
  login: {
    hk_only: "Mobile phone # (Hong Kong only)",
    login: "Login",
    smscode: "Get 4-digit SMS code"
  },
  logout: {
    logout: "Logout"
  },
  index: {
    home: "Home",
    orders: "Orders",
    items: "Items",
    goto: "Goto",
    alerts: "Alerts"
  },
  my_notifications: {
    heading: "{{name}}'s Order",
    all_notifications: "Show all notifications",
    show_unread: "Show unread only",
    mark_all_read: "Mark all read",
    no_unread: "No unread messages!"
  },
  beneficiary_warning: {
    delete_title: "Remove Client?",
    delete_info:
      "If this request will no longer be for a client/beneficiary you can delete the beneficiary details.",
    warning: "This cannot be undone!"
  },
  item_filters: {
    button_state: "State",
    button_location: "Location",
    with_and_without_images: "All",
    has_images: "Has Image(s)",
    no_images: "No Image(s)",
    image_filter_title: "Images",
    image_filter_title_info: "items with associated images or not",
    publish_filter_title: "Publishing status",
    publish_filter_title_info: "available for online browsing or not",
    published_and_private: "All",
    published: "Published",
    private: "Private",
    state_filter_title: "Item states",
    in_stock: "In Stock",
    process: "Processed",
    loss: "Lost",
    pack: "Packed",
    trash: "Trashed",
    recycle: "Recycled",
    in_stock_info: "At least one is available(i.e not designated)",
    designated: "Designated",
    designated_info: "All remaining quantity is reserved for order(s)",
    dispatched: "Dispatched",
    dispatched_info: "Entire quantity was previously sent out"
  },
  order_filters: {
    time_presets: {
      overdue: "Overdue",
      today: "Today",
      tomorrow: "Tomorrow",
      week: "This week",
      next_week: "Next week",
      month: "This month",
      next_month: "Next month"
    },
    button_state: "State",
    button_type: "Type",
    button_due: "Due",
    priority: "Priority",
    apply_filter_button: "Apply Filter",
    clear_button: "Clear",
    type_filter_title: "Order Types",
    time_filter_title: "Order Due Date",
    state_filter_title: "Order Statuses",
    appointment: "Appointments",
    appointment_info:
      "Client comes to select goods from our warehouse with help from our staff",
    online_orders: "Online Orders",
    online_orders_info: "Client ordered specific goods online",
    dispatch: "Dispatch",
    dispatch_info: "We will load into van and send to client",
    shipment: "Shipments",
    shipment_info:
      "Overseas organisation will have goods shipped to them from Crossroads' warehouse",
    other: "Others",
    other_info: "Special designations such as recycling",
    showPriority: "Only show priority orders",
    showPriority_info:
      "Priority orders have been in one state longer than they should and they need quick attention",
    submitted: "Submitted",
    submitted_info:
      "GoodCity orders that have yet to be reviewed.</br>Also StockIt 'Active' & 'From website.",
    processing: "Processing",
    processing_info:
      "GoodCity orders being reviewed.</br>Includes all other StockIt states.",
    awaiting_dispatch: "Scheduled",
    awaiting_dispatch_info: "GoodCity order with confirmed booking time.",
    dispatching: "Dispatching",
    dispatching_info: "GoodCity order being dispatched now.",
    closed: "Closed",
    closed_info:
      "Orders that were successfully completed.</br>Includes sent shipments.",
    cancelled: "Cancelled",
    cancelled_info: "Orders that were unsuccessful.",
    recent_orders: "Your recent orders"
  },
  split_quantity: {
    btn: "Split",
    title: "Split Quantity",
    header: "Split off how many items?",
    info_1: "All items will have Q Inventory Number",
    info_2: "This action cannot be undone",
    warning: "Quantity to split must be at least 1 and less than {{qty}}"
  },
  order_details: {
    cancel_order: "Cancel Order",
    update_reason: "Update Reason",
    client_name: "Client name:",
    hkid: "HKID",
    reference: "Reference #:",
    items: "Items",
    submitted: "Submitted:",
    order: "Order:",
    show_more_items: "Show more items",
    complete_process_warning:
      "You need to complete processing the Order first before dispatching.",
    cannot_designate_to_gc_order:
      "This GoodCity Order is either in cancelled or closed state. You can't designate item to this order.",
    add_item_to_order: "Add an item to this order",
    add_request_to_order: "Add request to order",
    resubmit_order_warning:
      "Resubmitting an Order will set order state to submitted. Are you sure you want to resubmit the order?",
    reopen_undispatch_warning:
      "You can only reopen an order after un-dispatching all dispatched items.",
    dispatch_later_undispatch_warning:
      "You need to un-dispatch all the dispatched items first.",
    dispatch_later_warning:
      "Dispatching later will change order state to awaiting dispatch state. Are you sure you want to dispatch later?",
    reopen_warning:
      "Reopening this order will set order state to dispatching. Are you sure you want to reopen the order?",
    restart_undispatch_warning:
      "You can only restart processing an order after un-dispatching all dispatched items.",
    restart_warning: "Are you sure you want to process the order again?",
    cancel_warning:
      "This will remove any items from the order and cancel the order.",
    close_warning: "You will not be able to modify the order after closing it.",
    close_order_dispatch_alert:
      "To close the Order, there should be 0 designated items and at least 1 dispatched item.",
    first_item_dispatch_warning:
      "You are dispatching first Item in the Order. This will also change state of the Order to dispatching.",
    close_order_popup:
      "All items in this order are dispatched. Would you like to close the Order? You will not be able to modify the order after closing it.",
    cancel_item_designate_warning:
      "This will also change state of the Order to processing from cancelled. Are you sure you want to designate?",
    cancel_order_alert:
      "To cancel the Order, there should be 0 dispatched items.",
    logistics: {
      scheduled: "Scheduled",
      type: "Type",
      transport_type: "Transport Type",
      destination: "Destination",
      vehicle_type: "Vehicle Type",
      base_estimate: "Base est.",
      add_note: "Tap to add/edit sticky note",
      tap_to_save: "tap to save",
      processing_checklist: "Processing checklist",
      checklist_incomplete: "Processing checklist is incomplete",
      pick_date: "Pick a date",
      vehicle: {
        self: "Private vehicle",
        ggv: "Needs hired vehicle"
      }
    },
    orders_packages: {
      sort_by: "Sort by",
      search: "Search Items",
      state_filters: "State Filters"
    }
  },
  order_transports: {
    online_order: "Online Order",
    appointment: "Appointment",
    shipment: "Shipment",
    carry_out: "Carry Out",
    stockit_local_order: "Local Order",
    unknown_transport: "Other"
  },
  order: {
    appointment: "Appointment",
    online_order: "Online order",
    processing: "Processing",
    submitted: "Submitted",
    draft: "Draft",
    submitted_by: "Submitted By",
    start_process: "Start Processing",
    restart_process: "Restart Processing",
    finish_process: "Finish Processing",
    process_summary: "Process Summary",
    due_date: "Due Date",
    submitted_for_client: "Submitted for client",
    start_dispatching: "Start Dispatching",
    cancel_order: "Cancel Order",
    awaiting_dispatch: "Awaiting Dispatch",
    cancelled: "Cancelled",
    dispatching: "Dispatching",
    dispatch_later: "Dispatch Later",
    closed: "Closed",
    close_order: "Close Order",
    reopen_order: "Reopen Order",
    resubmit: "Resubmit Order",
    numbers_warning: "Please enter 4 digit number.",
    mobile_warning: "Please provide a valid Hong Kong mobile number",
    for_our_charity: "For our charity (facilities / programs etc.)",
    for_client: "For client / beneficiary (personal use)",
    for_charity_sale: "For charity sale, bartering (any form of trade)",
    title: "Title",
    cannot_process_unless_approved:
      "An organisation user must be approved before the order can be processed",
    client_information: {
      title: "Client Information",
      is_order_client: "Is this order being placed on behalf of a client?",
      id_type_held_by_client: "Type of ID held by client",
      verify: "We will use this ID to verify client on arrival.",
      data_confidentiality: "All client data is kept strictly confidential.",
      hk_id: "Hong Kong Identity Card",
      asrf_id: "Asylum Seeker Recognizance Form",
      first_name: "Client's First Name",
      family_name: "Client's Family Name",
      name_instruction: "As shown on identity document",
      name_warning: "You must enter client’s name here.",
      phone_number: "Clients contact phone number",
      phone_number_instruction:
        "We will use this number to confirm schedule and details.",
      hk_id_instruction: {
        title: "Input the last 4 digits of the client's HKID",
        sub_title: "You do not need to include number in brackets"
      },
      rbcl: {
        title: "Input recognizance form ID (numbers only)",
        sub_title: 'Numbers appear after four letters e.g "RBCL"'
      }
    },
    user_title: {
      mr: "Mr",
      mrs: "Mrs",
      miss: "Miss",
      ms: "Ms"
    },
    request_purpose: {
      title: "Request Purpose",
      purpose: "Purpose of Goods",
      for_organisation: "No - order for organisation's own programs",
      for_client: "Yes - order is for a client/beneficiary",
      people_count_info: "How many people will benefit from these items?",
      district_label: "Where in Hong Kong will these goods be primarily used?",
      district_label_info: "This assists us with our reporting.",
      select_placeholder: "Select District",
      need_description: "Description of need",
      need_description_info: "Please briefly describe why goods are needed.",
      description_warning: "Description cannot be blank.",
      error_message: "You must select the district"
    },
    goods_details: {
      title: "Goods Details",
      info_1: "Please indicate type and quantity of each item needed.",
      info_2:
        "We regularly update the categories available based on the items we normally have in our stock. For unusual requirements not listed here please email",
      info_3: "and we will help if we can.",
      request_more: "Request more goods",
      type_label: "Goods type",
      quantity_label: "Quantity",
      description_details_label: "Specifics of item (Optional)",
      no_goods_error: "At least one Item is required.",
      no_time_slot_selected_error: "Please select appointment time."
    },
    request: {
      remove_req: "Remove this request from order {{orderCode}}",
      remove: "Remove"
    },
    appointment: {
      title: "Appointment Details",
      transport: "Transport",
      self_vehicle: "Client will bring private vehicle",
      hire_vehicle: "Client needs information about hiring vehicle",
      confirm_labor: "Confirm understanding of labor requirements",
      labor_info:
        "If the request is too large for the client to carry alone, please advise them to bring their own labor to load at our end and unload at their end. Crossroads does not provide labor, and hired truck drivers do not provide loading services without charge.",
      labor_confirmation: "I confirm understanding of labor requirements.",
      date: "Appointment Date",
      time: "Appointment Time",
      error_message: "You must select the appointment date"
    },
    booking_success: {
      success: "Success!",
      reference_number: "Reference Number",
      status: "Status",
      what_happen_after_booking: "What happens now?",
      after_booking_info_1:
        "Our staff will soon start checking the details and may contact you and/or beneficiery to clarify. If everything is okay then the order will be marked confirmed.",
      after_booking_info_2:
        "To see or modify your orders / appointments / preferences etc. visit your dashboard.",
      visit_dashboard: "Go to your dashboard"
    },
    confirm_booking: {
      title: "Confirmation",
      your_details: {
        title: "Your Details",
        phone: "Phone",
        organisation: "Organisation",
        position: "Position",
        email: "Email",
        name: "Name",
        preferred_contact_number: "Preferred Contact No."
      },
      request_purpose_detail: {
        title: "Request Purpose",
        purpose_of_goods: "Purpose of goods",
        number_benefiting: "Number benefiting",
        description_of_need: "Description of need"
      },
      client_info_detail: {
        title: "Client Information",
        id_type: "Type of ID held",
        id_number: "ID Number",
        client_name: "Client's Name",
        client_phone: "Client's Phone"
      },
      goods_detail: {
        title: "Goods Details",
        no_description: "No description provided"
      },
      appointment_detail: {
        title: "Appointment Details",
        transport: "Transport",
        labour: "Labour",
        labour_info:
          "Client understands labour requirements and can supply labour if needed.",
        appointment: "Appointment"
      },
      submit_order: "Submit order",
      info:
        "Please review the information below and then submit.</br>If you need to change something, click 'back'."
    }
  },
  item: {
    order_fulfilment: "Orders",
    edit: "edit",
    designate: "Designate",
    designate_partial: "Designate",
    partial_designate: "partial designate",
    dispatch: "dispatch",
    cap_dispatch: "Dispatch Item",
    undispatch: "undispatch",
    undesignate: "un-designate",
    partial_undesignate: "Un-designate",
    partial_undispatch: "Undispatch",
    separate: "separate",
    move: "Move",
    partial_move: "Partial Move",
    show_set_items: "Show other parts from the same set next",
    multiple_designation: "designated",
    all_dispatched: "Out of stock",
    max_undesignate: "From: {{code}}<br/>Quantity: {{qty}}",
    already_dispatched: "All designated Items are already dispatched",
    multiple: "Multiple",
    dispatch_message: "Are you sure you want to dispatch this Item?",
    related_orders: "Related Orders",
    action_by_user: "By {{userName}}",
    unlink: "unlink",
    add_to_set: "Add to set",
    already_in_set: "This item already belongs to a set"
  },
  orders_package: {
    actions: {
      edit_quantity: "Edit Qty",
      cancel: "Cancel",
      redesignate: "Redesignate",
      dispatch: "Dispatch",
      undispatch: "Undispatch"
    }
  },
  designate: {
    modify_designation: "Cancels the designation to order {{code}}",
    form_title: "{{status}} this item to order {{code}}",
    item_already_designated:
      "The Item is already designated to <span class='dispatched_order_code'>{{orderCode}}</span>.<br> If you proceed it will be removed from that order!",
    item_dispatched:
      "This Item was dispatched to <span class='dispatched_order_code'>{{orderCode}}</span>",
    designate: "Designate",
    overrides_existing: "Overrides an existing designation.",
    quantity: "Designates quantity of {{quantity}}.",
    already_designated: "This item is alreday designated to order {{code}}.",
    already_partially_designated:
      "Already {{qty}} items are designated to {{code}}, do you still want to designate {{partial_qty}} more?",
    partial_designate_title:
      "Designates {{partial_qty}} quantity to order {{code}}",
    cannot_designate:
      "There are partial items already designated to order {{code}} or order {{code}} is in cancelled state. Use Partial Designate feature to designate more.",
    redesignate:
      "Are you sure you want to re-designate this Item to this Order?"
  },
  undesignate: {
    form_title: "Remove this item from order {{code}}",
    undesignate: "Undesignate",
    quantity: "Undesignates quantity of {{quantity}}.",
    set_part: "Undesignates only part of set.",
    partial_undesignate: "Undesignates {{qty}} from order {{code}}."
  },
  dispatch: {
    dispatch: "Dispatch",
    from_order: "Dispatch this item to {{code}}",
    dispatch_quantity: "Dispatches quantity of {{quantity}}.",
    separate_set: "Dispatching <b>will separate this item from a set!</b>",
    dispatch_set: "You could dispatch the entire set instead.",
    all_items_dispatched:
      "All items from this order have been dispatched. Please close this order in StockIt.",
    separate_and_dispatch: "Separate item from set & dispatch"
  },
  edit_images: {
    upload: "Choose Image",
    camera: "Take Photo",
    cancel: "Cancel",
    add_photo: "Add photo",
    delete_confirm: "Are you sure you want to delete this image?",
    cant_delete_last_image: "You must have at least one image",
    donating_what: "What are you donating?",
    take_photos: "Take some photos",
    fullscreen_tooltip: "toggle fullscreen",
    favourite_tooltip: "set as cover image",
    delete_tooltip: "delete image",
    image_uploading: "Image Uploading ",
    remove_image: "Remove image",
    cancel_item: "Cancel item",
    cannot_provide_photo: "Cannot provide photo",
    last_image_with_item: "This is the only image associated with this item"
  },
  organisation: {
    add_user_button: "Add User to Organisation",
    add_user: "Add - User",
    name: "Name",
    description: "Description",
    registration: "Registration",

    name_en: "Name EN",
    name_zh_tw: "Name ZH",
    description_en: "Description EN",
    description_zh_tw: "Description ZH",
    new: "New Organisation",
    registration: "Registration",
    website: "Website",
    country: "Country",
    type: "Type",
    cancel_warning:
      "You will lose all your data. Are you sure you want to cancel this?",
    validation_error: {
      name: "Name cannot be blank.",
      country: "Country cannot be blank.",
      website: "Website format invalid."
    },

    user: {
      first_name: "First Name",
      last_name: "Family Name",
      mobile: "Mobile",
      email: "Email",
      position: "Position",
      phone_number: "Phone Number",
      john: "John",
      doe: "Doe",
      position_in_organisation: "Position within organisation",
      validation_error: {
        email: "Email should be valid.",
        blank_email: "Email cannot be blank.",
        first_name: "First name can't be blank.",
        family_name: "Family name can't be blank.",
        position: "Position can't be blank.",
        mobile: "Mobile Number should be 8 digits.",
        blank_mobile_number: "Mobile Number cannot be blank.",
        preferred_contact_number: "Preferred Contact Number should be 8 digits."
      }
    }
  },
  settings: {
    appointments: {
      title: "Appt. Quotas",
      quota: "Quota",
      default_quotas: "Default Quotas",
      special_dates: "Special Dates",
      override_quota: "Override default quotas for a given date",
      add_date: "Add Date",
      note: "Note",
      add_timeslot: "Add timeslot",
      select_timeslot: "Select timeslot",
      delete_date: "Delete this date",
      no_appointments: "No appointments",
      special_day_placeholder: "E.g: No available staff this Thursday",
      special_day_description_input:
        "Please explain the reasons for the change",
      select_day: "Select a day",
      no_bookings_allowed: "No bookings will be allowed for this date"
    }
  },
  search_offer: {
    offer_select_warning: "Do you want to assign this offer?"
  },
  search_order: {
    recent: "Recently used designations",
    recent_orders: "Your recently used orders."
  },
  select_location: {
    back: "Back",
    recent_used_locations: "Recently Used Locations",
    pick_from_location: "Select SOURCE location",
    pick_to_location: "Select DESTINATION",
    moving_item_to: "Moving this item to ",
    quantity_input: "Input the quantity to move ",
    dispatch_from: "Where to dispatch the package from ?",
    process_from: "From which location are you processing goods?",
    recycle_from: "Which location are you recycling from?",
    trash_from: "Which location are you trashing from?",
    loss_from: "Which location is having its quantity corrected?",
    gain_from: "Which location is having its quantity corrected?"
  },

  footer: {
    menu: "Menu",
    details: "Details",
    history: "History",
    staff: "Staff"
  },

  cancelled_order_packages: {
    multiple: "Multiple"
  },

  items_list_tabs: {
    active: "Active",
    requests: "Requests"
  },

  add_request: {
    add: "Add Request",
    quantity: "Quantity*",
    description: "Description",
    error: "Enter valid details.",
    validation_errors: {
      quantity: "Quantity cannot be blank."
    }
  },

  requested_items: {
    quantity: "Quantity",
    description: "Description",
    type: "Type"
  },

  search_users: {
    new_user: "Which user is this request being made for ?"
  },

  item_details: {
    quantity: "Quantity",
    initial_quantity: "Initial qty",
    type: "Type",
    description: "Description",
    size: "Size (cm)",
    quality: "Quality:",
    grade: "Grade :",
    weight: "Weight (kg)",
    constraints: "Constraints",
    restriction: "Restriction",
    comment: "Comments",
    pieces: "Pieces",
    condition: "Condition :",
    quantity_inside: "Quantity inside :",
    validation_errors: {
      description: "Description cannot be blank."
    },
    viewing_set: "Viewing part of this set",
    show_set: "Show Set",
    hide_set: "Hide Set",
    not_inventorized_or_missing:
      "This item is not inventoried yet or has been marked as missing."
  },

  inventory_options: {
    auto: "Auto Id",
    input: "Input Id",
    scan: "Scan Id"
  },

  item_status_bar: {
    in_stock: "In Stock",
    multiple: "Multiple"
  },

  location_filters: {
    all_locations: "ALL LOCATIONS",
    clear: "(Clear Location Filter)",
    recent_used_locations: "Recently used locations"
  },

  no_image: "No image available.",

  images: {
    add_image: "Add Some Photos"
  },

  items: {
    history: "History",
    order_code: "Order Code",
    quantity: "Quantity",
    number: "Number",
    value: "Value per unit (HK$)",
    apply_default: "Apply Default:",
    no_history: "No history available.",
    new: {
      not_set: "Not Set",
      saleable: "Saleable",
      not_selling: "Not selling",
      add: "Add",
      add_images: "Add Images",
      quantity: "Quantity*",
      type: "Type*",
      description: "Description*",
      size: "Size (cm)",
      quality: "Quality*",
      grade: "Grade:",
      weight: "Weight (kg)",
      publish: "Publish",
      duplicate: "Duplicate",
      duplicate_successful_message:
        "Item with inventory number '{{inventoryNo}}' was created ",
      labels: "Labels",
      pieces: "Pieces",
      expiry_date: "Expiry Date",
      condition: "Condition:",
      donation: "CAS#",
      location: "Location*",
      inventory: "Inventory#",
      print: "& Print {{labels}}",
      printer: "Printer",
      cancel_warning:
        "You will lose all your data. Are you sure you want to cancel this item?",
      subform: {
        add_item: "Add new item",
        delete_subform_waring:
          "If you change to {{newPackageName}} some details related to {{packageName}} will no longer be valid. These details will be deleted."
      },
      validation_errors: {
        blank_label: "Can't be blank",
        max_label: "Max 300",
        invalid_dimensions:
          "Provide all 3 dimensions(or none). Dimension must be greater than 0",
        description: "Description cannot be blank.",
        donation: "Must be a number or in the form 'CAS-12345'",
        invalid_location: "Scanned Location is invalid.",
        blank_location: "Location can't be blank.",
        quantity: "Quantity cannot be blank.",
        blank_notification: "Location cannot be blank.",
        blank_valuation: "Value cannot be blank.",
        blank_inventory_number: "Inventory number cannot be blank."
      }
    },
    select_set_type: "Select a type for the new set",
    no_box_in_set: "Boxes and pallets are not allowed in sets",
    containers_label: "Boxes or pallets that contain this item",
    action_label: "Actions",
    make_set: "Make Set",
    actions: {
      process: "Process",
      loss: "Loss (decrease)",
      trash: "Trash",
      recycle: "Recycle",
      gain: "Gain (increase)",
      dispatch: "Dispatch",
      undispatch: "Undispatch",
      move: "Move",
      edited: "Edit",
      inventory: "Inventory"
    },
    staff: "Staff Conversation"
  },
  modify_designation: {
    designation_to: "Designation to",
    item: "Item:",
    order: "Order:",
    quantity_designated_to: "Quantity designated to",
    maximum: "Maximum",
    cancel: "Cancel the designation of this item"
  },
  donation: {
    title: "CAS#",
    donation_number_error: "Must be in the form 'CAS-12345'"
  },
  partial_designate: {
    in_stock: "In Stock",
    multiple: "Multiple",
    move_message: "Designates only part of set.",
    warning_text: "You can only designate maximum {{qty}} items",
    confirm: "Confirm the quantities you are designating."
  },
  partial_undesignate: {
    modify: "Modify",
    dispatch: "Dispatch",
    qty: "Qty:",
    status: "{{inventoryNumber}}: Status",
    private: "(Private)",
    designated: "Designated",
    dispatched: "Dispatched",
    available: "Available",
    in_hand_quantity: "Total quantity on hand:",
    lifetime_quantity: "Total lifetime quantity"
  },
  partial_dispatch: {
    dispatch_to: "{{inventoryNumber}}: Dispatch to  {{orderCode}}",
    qty: "Qty:",
    total_to_dispatch: "Total to dispatch (must = {{qty}})",
    dispatch: "Dispatch"
  },
  print_label: {
    sent: "Sent to printer"
  },
  publish_item: {
    publish: "Publish",
    unpublish: "Unpublish",
    publish_message1:
      "You are about to publish this package for clients to view and request online.",
    publish_message2:
      "Please ensure descriptions and images are high quality before proceeding.",
    unpublish_message:
      "You are about to unpublish this package.Clients will no longer be able to view or request it online."
  },
  designate_form: {
    designate: "Designate",
    item: "Item",
    to_order: "To Order",
    select_order: "Select Order",
    quantity: "Quantity",
    max: "Max",
    help_text: "Help",
    shipping: "Shipping",

    help: {
      available: "Available",
      make_available: "To make more of this item available...",
      boxed_message:
        "{{boxedQuantity}} are boxed & {{palletizedQuantity}} are palletized",
      remove_from_box: "Remove to designate separately.",
      designate_box_pallet: "Or, designate whole box/pallet.",
      designated_message:
        "{{designatedQuantity}} designated & {{dispatchedQuantity}} dispatched",
      modify_order: "Modify or cancel other orders.",
      wrong_quantity: "Is the item quantity wrong?",
      increase_by_gain: "Increase it using gain feature",
      gain: "Gain"
    }
  },
  users: {
    cancel_user_warning:
      "You will lose all your data. Are you sure you want to cancel this User?",
    title: "Title",
    image: "Image",
    add_image: "Add Image",
    edit_image: "Edit Image",
    delete_image: "Delete Image",
    disabled: "Disabled",
    roles: "Roles",
    organisation: "Organisation",
    create_new_user: "Add new user",
    first_name: "First Name",
    last_name: "Last Name",
    mobile: "Mobile",
    email: "Email",
    district: "District",
    preferred_language: "Preferred Language",
    languages: {
      unknown: "Unknown",
      english: "English",
      chinese: "Chinese"
    },
    registered_on: "Registered on",
    last_connected_on: "Last connected on",

    charity_position: {
      add_charity_position: "Add Charity Position",
      position: "Position",
      status: "Status",
      preferred_number: "Preferred Number",
      cancel_warning: "Are you sure you want to cancel?",
      validation_errors: {
        preferred_number: "You must provide a contact number",
        organisation: "Organisation cannot be blank"
      }
    },

    details: {
      last_on_goodcity: "Last on GoodCity",
      contact_details: "Contact Details",
      staff_roles: "Staff / Volunteer Roles",
      stock_app: "Stock App",
      admin_app: "Admin App",
      disable_user_account: "Disable User Account",
      disable_user: "Disable User",
      disabled_user_info:
        "User will be denied access to all apps including donor app.",
      disabled_user_note:
        "Note: you are allowed remove the phone and email address from a disabled user account. This can be useful if the number has been assumed by a different person without giving the new user another person 's history.",
      re_enable_user_account: "Re-enable User Account",
      enabled_user_info: "All prior access rights will be reserved.",
      enabled_user_note:
        "Note: If you do not wish this user to have same rights to access apps or act on behalf of charities as they had before, please modify their access.",
      enable_user: "Re-enable User",
      re_enable: "Re-enable",
      account_disabled: "Account Disabled"
    },

    contact_details: {
      title: "Contact Details",
      unauthorised_error:
        "Sorry, you are not authorised to edit details for this user."
    },

    roles: {
      admin_app_details: "Admin App Details",
      unauthorised_error:
        "Sorry, you are not authorised to update roles for this user.",
      access_status_for: "Access Status for",
      no_access: "No Access",
      access_until: "Access Until",
      access_forever: "Access Forever",
      roles_for_offers: "Role assigned for processing offers",
      reviewer: "Reviewer",
      reviewer_role_info: "This role is for reviewing offers.",
      supervisor: "Supervisor",
      supervisor_role_info: "This role is for managing offers.",
      admin_role_error:
        "Access to Admin App requires at least one role to be assigned.",
      admin_printer_label: "Preferred Label Printer in Admin App",
      stock_app_details: "Stock App Details",
      stock_role_error:
        "Access to Stock App requires at least one role to be assigned.",
      stock_printer_label: "Preferred Label Printer in Stock App",
      role_for_orders: "Role assigned for processing orders",
      role_for_stock: "Role assigned for processing stock",
      order_fulfilment_role: "Order Fulfilment",
      order_fulfilment_role_info: "This role is for reviewing orders.",
      order_administrator_role: "Order Administrator",
      order_administrator_role_info: "This role is for managing orders.",
      stock_fulfilment_role: "Stock Fulfilment",
      stock_fulfilment_role_info: "This role is for reviewing stock items.",
      stock_administrator_role: "Stock Administrator",
      stock_administrator_role_info: "This role is for managing stock items."
    }
  },

  no_permission: {
    welcome: "Welcome!",
    logout: "Logout",
    login_msg:
      "You have successfully Logged in! However, you need permission to start working on stock.",
    manager_msg: "Ask your manager to grant permissions and then try again",
    try_again: "Try again"
  }
};
