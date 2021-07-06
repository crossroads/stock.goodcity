export default {
  offline_error: "無法加載，請檢查網絡連線",
  unexpected_error: "錯誤",
  unavailable_record: "很抱歉，我們未有找到相關資料",
  okay: "確定",
  add_inventory_item: "Add item to inventory",
  loading: "正在加載...",
  loading_timeout_error: "讀取時限已過",
  loading_timeout: "需時太久了！點擊重新加載",
  "language.en": "English",
  "language.zh": "中文",
  back: "返回",
  switch_language: "切換語言",
  no_search_results: "沒有搜尋結果",
  search: "搜尋",
  state: "State",
  label: "Label",
  location: "Location",
  in_stock: "有貨存",
  QuotaExceededError:
    "網頁部分功能於Safari 瀏覽器的 <b>「私密瀏覽」模式</b>並不適用。 請嘗試</br><ul><li><a href='https://itunes.apple.com/in/app/goodcitystock.hk/id1144806764?mt=8' style='color: black!important; background-color: #dee4eb !important;'>下載 iOS 手機應用程式</a></li><li>使用 Safari 瀏覽器正常模式 </li><li> 使用Chrome瀏覽器的「無痕模式」</li></ul>",
  search_min: "搜尋 (請輸入最少3個字元)",
  cancel: "取消",
  ok: "確定",
  done: "Done",
  search_no_results: "對不起，沒有搜尋結果",
  version: "Stock v.",
  organisation_title: "機構",
  add: "+新增",
  save: "儲存",
  details: "詳情",
  orders_in_process: "Orders In Process",
  orders: "訂單",
  users_count: "用戶",
  menu: "主目錄",
  manage_system: "Manage System",
  new_item_menu: "Create New Inventory Item",
  new_order_menu: "Create New Order",
  search_organisation: "搜尋機構",
  not_now: "稍後",
  incomplete_form: "請填寫必需填寫之項目以繼續下一步",
  continue: "繼續",
  show: "Show",
  save_changes: "儲存變更",
  discard: "棄置",
  discard_changes: "棄置變更",
  manage_charity_users: "Manage charity users",
  create_new_item: "+Item",
  create_new_box: "+Multi-Item Box",
  create_new_pallet: "+Multi-Item Pallet",
  manage_inventory: "Quotas",
  manage_users: "管理用戶",
  search_user: "Search User",
  new_international_order: "+國際",
  new_hk_order: "+HK Order",
  full_name: "{{firstName}} {{lastName}}",
  mobile_prefix: "+852",
  confirm: "確定",
  not_found:
    "Oooops, the location you're headed to doesn't seem to exist anymore. Sorry!",
  unavailable_item: "Sorry! This item is not available.",
  unavailable_order: "Sorry! This order is not available.",
  yes: "Yes",
  no: "No",
  stocktakes: {
    title: "盤點",
    create_new: "新增新的盤點",
    confirm_create: "新增盤點",
    select_location: "選擇盤點位置",
    name: "名稱",
    location: "位置",
    comment: "備註",
    saving: "儲存變更。。。",
    save_error: "出現錯誤。部份變更未被儲存",
    try_again: "重試",
    expected_qty: "預期數量",
    recorded_change: "已記錄的變更",
    requires_recount: "需要(重新)點算",
    confirm_count: "確定數量為 {{count}}",
    over: "超出",
    under: "尚欠",
    add_item: "新增項目",
    scanning_failure: "未能啟動掃瞄器",
    scanner_mode: "掃瞄器模式",
    stop_scanning: "停止掃瞄",
    commit_stocktake: "完成盤點",
    cancel_stocktake: "取消盤點",
    only_show_variances: "只顯示差別",
    only_show_warnings: "只顯示警告事項",
    unknown_inventory_number: "未能找到{{code}}庫存號碼",
    confirm_cancel: "這次盤點會被取消。確定？",
    processing_text:
      "This stocktake is being processed, this may take a few minutes. Please check again soon",
    tips: {
      start_counting: "你已點算的項目會在此出現",
      review_tab: "點選「檢視」以查看完整項目清單"
    },
    errors: {
      name_exists: "已存在相同名稱的盤點",
      stocktake_exists_for_location: "警告：當前位置已存在其他盤點"
    },
    states: {
      open: "開放",
      closed: "關閉",
      cancelled: "已取消",
      processing: "處理中",
      awaiting_process: "Awaiting Process"
    },
    detail_tabs: {
      count: "點算",
      review: "檢視"
    },
    counts: {
      counted: "已點算",
      gains: "增加",
      losses: "減少",
      warnings: "警告"
    }
  },
  box_pallet: {
    indicate_amount: "指出要從以下每個位置中取多少份量",
    available: "可用的",
    location: "位置",
    quantity: "数量",
    number_to_move: "移動的數量",
    move_to: "移動項目",
    move: "移动",
    not_now: "稍後",
    add_to: "增加項目",
    remove: "移除",
    content: "内容",
    details: "詳情",
    bad_item: "Bad item",
    invalid_quantity: "已增加的份量不可多於每個位置的可用的份量",
    type_to_search: "输入搜索要添加的项目。",
    cannot_change_type:
      "Cannot change type of a box with items. Please remove the items and try again",
    remove_from: "Remove from",
    item: "Item",
    from: "From",
    to_location: "To Location",
    max: "Max"
  },
  messages: {
    you: "您",
    chat_note: "與使用者對話",
    send: "發送",
    day: {
      today: "今天",
      morning: "早上",
      afternoon: "下午"
    }
  },
  camera_scan: {
    permission_error: "並未允許使用手機相機"
  },
  weekday_1: "星期一",
  weekday_2: "星期二",
  weekday_3: "星期三",
  weekday_4: "星期四",
  weekday_5: "星期五",
  weekday_6: "星期六",
  weekday_7: "星期日",
  online_status: {
    online: "已連線",
    not_connected: "並未連線"
  },
  order_cancellation_reason: {
    warning: "此動作將移除訂單內的所有物品並取消訂單",
    title: "取消訂單的原因",
    other: "取消訂單的原因",
    reason_count: "{{count}} remaining"
  },
  order_client_summary: {
    remove_client_title: "移除受惠者",
    remove_client_info: "移除受惠者",
    client_name: "受惠者姓名",
    client_phone: "受惠者電話號碼",
    id_title: "身份證明文件類別",
    id_number: "身份證號碼",
    no_client: "沒有受惠者",
    add_beneficiary: "新增受惠者",
    request_purpose: "申請原因",
    number_benefiting: "受惠人數",
    primary_location: "主要地點",
    description_of_need: "有關需要的詳情",
    description_error: "必須填寫有關詳情",
    people_helped_error: "必須填寫受惠人數"
  },
  order_contact_summary: {
    change_contact: "更改聯絡人",
    choose_different_contact: "揀選不同的聯絡人",
    organisation_title: "機構名稱",
    contact_name: "聯絡人姓名",
    contact_phone: "聯絡電話",
    preferred_contact_number: "Preferred contact number",
    contact_position: "聯絡人職位",
    contact_email: "聯絡電郵",
    contact_last_seen: "最後連線時間",
    contact_registered: "已登記",
    submitted_by: "提交自",
    total_requests: "全部要求",
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
    summary: "總結",
    goods: "物品",
    logistics: "物流",
    staff: "Staff",
    user: "User"
  },
  order_summary_tabs: {
    contact: "聯絡",
    client: "用途/受惠者"
  },
  authenticate: {
    input_code: "請輸入驗證碼"
  },
  _resend: {
    try_again: "Try again in {{timer}} seconds",
    please_wait: "Please wait {{timer}} seconds before requesting a pin again",
    resend: "重新發送"
  },
  _verification_pin: {
    input_code: "請輸入短訊(SMS)收到的4位數字認證碼:",
    auth_error: "認證碼不正確!請重新輸入。"
  },
  login: {
    hk_only: "手提電話號碼(只限香港)",
    login: "登入",
    smscode: "發送短訊(SMS)認證碼"
  },
  logout: {
    logout: "登出"
  },
  index: {
    home: "主目錄",
    orders: "訂單",
    items: "物資",
    goto: "前往",
    alerts: "Alerts"
  },
  beneficiary_warning: {
    delete_title: "移除受惠者?",
    delete_info: "如此申請不再受惠於個案受惠者，你可刪除受惠者資料。",
    warning: "不能取消變更!"
  },
  item_filters: {
    button_state: "State",
    button_location: "Location",
    with_and_without_images: "全部",
    has_images: "包含相片",
    no_images: "沒有相片",
    image_filter_title: "相片",
    image_filter_title_info: "有否與物品相關的圖片",
    publish_filter_title: "公開狀況",
    publish_filter_title_info: "能否與網上瀏覽",
    published_and_private: "全部",
    published: "已刊登",
    private: "未被刊登",
    state_filter_title: "物件狀態",
    in_stock: "有貨存",
    confirm: "Confirm",
    process: "Processed",
    loss: "Lost",
    pack: "Packed",
    trash: "Trashed",
    recycle: "Recycled",
    in_stock_info: "最少一件有貨存（即未被指派）",
    designated: "已指派",
    designated_info: "所有餘下的數量已被預留至訂單",
    dispatched: "已派送",
    dispatched_info: "較早前已送出所有數量"
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
    priority: "優先",
    apply_filter_button: "進行篩選",
    clear_button: "清除",
    type_filter_title: "訂單類別",
    time_filter_title: "Order Due Date",
    state_filter_title: "訂單狀態",
    appointment: "預約",
    appointment_info: "受惠者可前往我們的貨倉在職員的協助下挑選物品",
    online_orders: "網上訂單",
    online_orders_info: "受惠者已於網上訂了指定物品",
    carry_out: "國際手攜訂單",
    carry_out_info: "由海外機構自行安排運送的小型訂單",
    dispatch: "派送",
    dispatch_info: "我們會將物品裝載到貨車並運送至受惠者",
    shipment: "裝運",
    shipment_info: "由海外機構自行安排運送的小型訂單",
    other: "其他",
    other_info: "特別的指派點例如回收",
    showPriority: "只顯示優先處理訂單",
    showPriority_info: "優先訂單已停留在一狀態過長，需要盡快處理",
    submitted: "已提交",
    submitted_info:
      "好人好巿訂單尚未被審批。<br/>還有StockIt 'Active' & '從網頁'。",
    processing: "處理中",
    processing_info: "好人好巿訂單正在審批。<br/>包括所有StockIt 狀態。",
    awaiting_dispatch: "已安排時間",
    awaiting_dispatch_info: "已確認時間的好人好巿訂單",
    dispatching: "派送中",
    dispatching_info: "好人好巿訂單現正派送",
    closed: "已完結",
    closed_info: "訂單已完成 <br/> 包括已送出的運輸。",
    cancelled: "已取消",
    cancelled_info: "訂單尚未成功。",
    recent_orders: "您最近的訂單"
  },
  split_quantity: {
    btn: "分拆",
    title: "分拆數量",
    header: "分拆多少件?",
    info_1: "所有物品將有Q 的倉存編號",
    info_2: "此動作將不能復原",
    warning: "分拆數量需最少1 件或少於 {{qty}}"
  },
  order_details: {
    cancel_order: "Cancel Order",
    update_reason: "Update Reason",
    client_name: "服務對使用者姓名",
    hkid: "香港身份證號碼",
    reference: "參考編號:",
    items: "物資",
    submitted: "已提交:",
    order: "訂單:",
    show_more_items: "顯示更多物資",
    complete_process_warning: "您必需先完成訂單處理程序，才可以派送物資。",
    cannot_designate_to_gc_order:
      "此訂單狀態為「已取消」或「已完成」。您不能指派物資到此訂單。",
    add_item_to_order: "新增物資到此訂單",
    add_request_to_order: "於此訂單新增申請",
    resubmit_order_warning:
      "請確認您想重新提交訂單。請注意，重新提交訂單將會令訂單狀態重設為「已提交」。",
    reopen_undispatch_warning: "您必須先取消派送物資才可以重開訂單。",
    dispatch_later_undispatch_warning:
      "訂單中仍有已派送物資!你必須先取消派送。",
    dispatch_later_warning:
      "請確認你想稍後派送。請注意，稍後派送會令訂單狀態設置至「等待派送」。 ",
    reopen_warning:
      "請確認你想重開訂單。請注意，重開訂單將會令訂單狀態重設至「派送中」。",
    restart_undispatch_warning:
      "您必須先取消所有派送才可以中心開始訂單處理程序。",
    restart_warning: "請確認您想重新開始訂單處理程序。",
    cancel_warning: "此動作將會移除訂單中的任何物品並取消訂單。",
    close_warning: "完成訂單後，您將不能再修改訂單内容。",
    close_order_dispatch_alert:
      "完結訂單, 需要0 件已指派物品或最少1 件已派送物品。",
    first_item_dispatch_warning:
      "您正派送訂單中的第一件物資。訂單狀態將會設置為「派送中」。",
    close_order_popup:
      "此訂單中所有物資已經派送完畢。請確認您要完成訂單。請注意，訂單完成後您將不能再修改訂單内容。",
    cancel_item_designate_warning:
      " 請確認繼續指派物資到此訂單。請注意，訂單狀態將會由「已取消」重設為「處理中」。",
    cancel_order_alert: "如需取消訂單，訂單中只能存有0 件已派送物品。",
    logistics: {
      scheduled: "已安排時間",
      type: "種類",
      transport_type: "運輸種類",
      destination: "目的地",
      vehicle_type: "車型種類",
      base_estimate: "估計",
      add_note: "按下以增加/修改記事板",
      tap_to_save: "按下以儲存",
      processing_checklist: "處理中的清單",
      checklist_incomplete: "處理中的清單尚未完成",
      pick_date: "選擇日期",
      vehicle: {
        self: "私人車輛",
        ggv: "需要聘用車輛"
      }
    },
    orders_packages: {
      sort_by: "Sort by",
      search: "Search Items",
      state_filters: "State Filters"
    }
  },
  order_transports: {
    online_order: "網上訂單",
    appointment: "預約",
    shipment: "貨運",
    carry_out: "國際手攜訂單",
    stockit_local_order: "Local Order",
    unknown_transport: "其他"
  },
  order: {
    appointment: "預約",
    online_order: "網上訂單",
    processing: "處理中",
    submitted: "訂單已經提交",
    draft: "等待提交",
    start_process: "開始訂單處理",
    restart_process: "重新開始訂單處理",
    finish_process: "完成訂單處理",
    start_dispatching: "開始派送",
    cancel_order: "取消訂單",
    awaiting_dispatch: "等待派送",
    dispatch_later: "稍後派送",
    cancelled: "已取消",
    dispatching: "派送中",
    closed: "訂單已完成",
    add_overseas_order: "新增海外訂單",
    close_order: "完成訂單",
    reopen_order: "重開訂單",
    resubmit: "重新提交訂單",
    submitted_by: "提交自",
    process_summary: "概覽",
    due_date: "到期日",
    order_number: "訂單號碼",
    submitted_for_client: "為服務使用者提交",
    numbers_warning: "Please enter 4 digit number.",
    mobile_warning: "Please provide a valid Hong Kong mobile number",
    for_our_charity: "For our charity (facilities / programs etc.)",
    for_client: "For client / beneficiary (personal use)",
    for_charity_sale: "For charity sale, bartering (any form of trade)",
    title: "Title",
    cannot_process_unless_approved:
      "An organisation user must be approved before the order can be processed",
    international: {
      shipment_date: "貨運日期",
      date_info: "如未能確定, 可以預計數目代替",
      errors: {
        description_error: "請簡單描述",
        date_error: "你必須選擇一個日期",
        empty_country_error: "你必須選擇一個國家",
        empty_people_helped_error: "You must input a number",
        code_error: "必須為一個4或5位數字號碼 (後綴可選填)"
      }
    },
    client_information: {
      title: "受惠者資料",
      is_order_client: "您正在代替受惠者下訂單?",
      id_type_held_by_client: "受惠者持有的身份證明文件類別",
      verify: "當天我們將以此身份證明文件核對受惠者身份",
      data_confidentiality: "所有受惠者資料將會被嚴格保密",
      hk_id: "香港身份證",
      asrf_id: "酷刑聲請人身份證明表",
      first_name: "受惠者名稱",
      family_name: "受惠者姓氏",
      name_instruction: "顯示於身份證明文件上",
      name_warning: "您必需填寫受惠者姓名於此",
      phone_number: "受惠者聯絡電話號碼",
      phone_number_instruction: "我們將會以此號碼來確認時間及詳情",
      hk_id_instruction: {
        title: "請輸入受惠者身份證明文件的最後4位數字",
        sub_title: "您不需要包括括號內的數字"
      },
      rbcl: {
        title: "填寫身份證明表的編號 (只限數字)",
        sub_title: "號碼出現於四位英文字母後,如RBCL"
      }
    },
    user_title: {
      mr: "先生",
      mrs: "太太",
      miss: "小姐",
      ms: "女士"
    },
    request_purpose: {
      title: "申請目的",
      purpose: "申請有關物品的目的",
      for_organisation: "不是 - 訂單是給機構活動使用的",
      for_client: "是  - 訂單是給受惠者使用的",
      people_count_info: "多少位人士將會受惠於這些物品?",
      district_label: "這些物品將會於香港哪一地區使用?",
      district_label_info: "這項資料會協助我們作統計之用。",
      select_placeholder: "選擇地區",
      need_description: "需要的原因",
      need_description_info: "請簡單填寫為什麼需要這些物品",
      description_warning: "此欄不能留空",
      error_message: "你需要選擇地區"
    },
    goods_details: {
      title: "物品資料",
      info_1: "請指出每項所需物品的類別及數量。",
      info_2:
        "我們恆常地會就著貨存去更新可選擇之物品類別。有一些不常見物品並不限於此，請以電郵聯絡。",
      info_3: "我們會盡力幫忙。",
      request_more: "申請更多物品",
      type_label: "物品種類",
      quantity_label: "數量",
      description_details_label: "指定物品 (非必需)",
      no_goods_error: "需要最少一件物品",
      no_time_slot_selected_error: "請選擇預約時間"
    },
    request: {
      remove_req: "從訂單 {{orderCode}} 中移除申請",
      remove: "移除"
    },
    appointment: {
      title: "Appointment Details",
      transport: "Transport",
      self_vehicle: "受惠者會自備車輛",
      hire_vehicle: "受惠者需要聘用車輛的資料",
      confirm_labor: "確認已清楚明白搬運工人的要求",
      labor_info:
        "如受惠者申請的物品體積龐大，請建議他／她帶備足夠人手以在十字路會提貨及到達目的地時卸貨。十字路會未能提供搬運工人，而聘用車輛司機協助搬運是需要額外收費的。",
      labor_confirmation: "我確認已清楚明白搬運工人的要求",
      date: "預約日期",
      time: "預約時間",
      error_message: "你需要選擇約定日期"
    },
    booking_success: {
      success: "成功!",
      reference_number: "參考編號",
      status: "狀態",
      what_happen_after_booking: "現在的狀況是？",
      after_booking_info_1:
        "我們的職員將很快檢查資料及或許會聯絡閣下或您的受惠者核實。如一切無誤，訂單將轉至確認狀態。",
      after_booking_info_2:
        "要翻查或更改您的訂單／預約／設定等，請到您的控制頁。",
      visit_dashboard: "前往控制頁"
    },
    confirm_booking: {
      title: "確認",
      your_details: {
        title: "您的資料",
        phone: "電話",
        organisation: "機構",
        position: "職位",
        email: "電郵",
        name: "Name",
        preferred_contact_number: "Preferred Contact No."
      },
      request_purpose_detail: {
        title: "申請目的",
        purpose_of_goods: "物品用途",
        number_benefiting: "受惠人數",
        description_of_need: "需要的詳情"
      },
      client_info_detail: {
        title: "受惠人士資料",
        id_type: "身份證明文件類別",
        id_number: "身份證號碼",
        client_name: "受惠人士姓名",
        client_phone: "受惠人士電話"
      },
      goods_detail: {
        title: "物品資料",
        no_description: "並未提供詳情"
      },
      appointment_detail: {
        title: "預約資料",
        transport: "運輸",
        labour: "搬運工人",
        labour_info: "受惠人士清楚明白搬運的要求及如有需要，能自己處理搬運。",
        appointment: "預約"
      },
      submit_order: "提交申請",
      info: "請審視以下資料然後提交。</br>如需更改任何項目，請按＂返回＂。"
    }
  },
  item: {
    order_fulfilment: "訂單",
    edit: "修改",
    designate: "指派",
    designate_partial: "指派部分物資",
    partial_designate: "指派部分物資",
    dispatch: "派送物資",
    cap_dispatch: "派送物資",
    undispatch: "取消派送",
    undesignate: "取消指派",
    partial_undesignate: "取消指派部分物資",
    partial_undispatch: "Undispatch",
    separate: "分拆",
    move: "移動",
    partial_move: "移動部分物資",
    show_set_items: "顯示套裝中的其他物資",
    multiple_designation: "已被指派",
    all_dispatched: "缺貨",
    max_undesignate: "從: {{code}}<br/>數量: {{qty}}",
    already_dispatched: "所有被指派的物資已經被派送",
    multiple: "多項",
    dispatch_message: "請確認你要派送此物資",
    related_orders: "Related Orders",
    action_by_user: "By {{userName}}",
    unlink: "unlink",
    add_to_set: "Add to set",
    already_in_set: "This item already belongs to a set"
  },
  camera: {
    click: "Click picture",
    cancel: "Cancel",
    take: "Take Photo",
    choose: "Choose Image{{click_image}}",
    switch: "Switch Camera"
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
    modify_designation: "取消指派至訂單 {{code}}",
    form_title: "指派此物資到訂單{{code}}",
    item_already_designated:
      "此物品已被指派至<span class='dispatched_order_code'>{{orderCode}}</span>.<br>. 如你繼續,它將會被移出該訂單!",
    item_dispatched:
      "此物品已被派送出至<span class='dispatched_order_code'>{{orderCode}}</span>",
    designate: "指派",
    overrides_existing: "確認重新指派物資",
    quantity: "指派{{quantity}}件",
    already_designated: "此物資已經被指派至訂單{{code}}.",
    already_partially_designated:
      "{{qty}} 件已經被指派至{{code}}。請確認你仍需要指派額外 {{partial_qty}}件物資到此訂單。",
    partial_designate_title: "指派{{partial_qty}}件到訂單{{code}}",
    cannot_designate:
      "部分物資已經被指派至訂單{{code}}/訂單{{code}}狀態為「已取消」。請用「指派部分物資」選項將更多物資指派至此訂單。",
    redesignate: "請確認你想重新指派這件物資到此訂單。"
  },
  undesignate: {
    form_title: "從訂單{{code}}中移除這件物資",
    undesignate: "取消指派",
    quantity: "取消指派{{quantity}}件物資",
    set_part: "取消指派套裝中部分物資。",
    partial_undesignate: "從訂單{{code}}中取消指派{{qty}}件"
  },
  dispatch: {
    dispatch: "派送物資",
    from_order: "派送物資到 {{code}}",
    dispatch_quantity: "派送{{quantity}}件物資",
    separate_set: "派送<b>將會令此物資從套裝中移除!</b>",
    dispatch_set: "你可以選擇派送整套物資。",
    all_items_dispatched:
      "此訂單中的所有物資已經派送完畢，請在Stockit系統上完成訂單",
    separate_and_dispatch: "將物資從套裝中移除並派送"
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
    add_user_button: "新增機構用戶",
    add_user: "新增 - 用戶",
    name: "姓名",
    description: "機構概要",
    registration: "註冊編號",
    name_en: "機構名稱(英文)",
    name_zh_tw: "機構名稱(中文)",
    description_en: "機構簡介(英文)",
    description_zh_tw: "機構簡介(中文)",
    new: "New Organisation",
    registration: "註冊編號",
    website: "網頁",
    country: "國家/ 地區",
    type: "類別",
    cancel_warning: "你將會遺失所有資料。你確定要取消嗎？",
    validation_error: {
      name: "名稱不能留空。",
      country: "國家/地區不能留空。"
    },
    user: {
      first_name: "名",
      last_name: "姓",
      mobile: "手提電話號碼",
      email: "電郵",
      position: "職位",
      phone_number: "電話號碼",
      john: "大文",
      doe: "陳",
      position_in_organisation: "機構內的職稱",
      validation_error: {
        email: "請輸入有效的電郵地址",
        blank_email: "電郵地址不能留空",
        mobile: "手提電話號碼必須為8個數字",
        blank_mobile_number: "手機號碼不能留空",
        first_name: "名字不能留空",
        family_name: "姓氏不能留空",
        position: "Position can't be blank.",
        preferred_contact_number: "聯絡號碼需要為8位數字"
      }
    }
  },
  settings: {
    appointments: {
      title: "預約配額",
      quota: "配額",
      default_quotas: "預設配額",
      special_dates: "特別日期",
      override_quota: "取代預設配額以獲得可選擇之日期",
      add_date: "設定日期",
      note: "別註",
      add_timeslot: "設定時間",
      select_timeslot: "選擇時間段",
      delete_date: "刪除此日期",
      no_appointments: "沒有預約",
      special_day_placeholder: "例:星期四並沒有當值職員",
      special_day_description_input: "請提供作出改動之原因",
      select_day: "選擇一個日期",
      no_bookings_allowed: "此日期不允許預約"
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
    pick_from_location: "Where would you like to move FROM ?",
    pick_to_location: "Where would you like to move INTO ?",
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
    error: "Goods Type and Quantity cannot be blank",
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
    new_user: "Which user is this request being made for ?",
    edit_user: "Edit User",
    assign_charity_to_user: "Please add this user to a valid charity first."
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
    quantity_inside: "內含數量 :",
    validation_errors: {
      description: "English description cannot be blank."
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
      description_required: "Description*",
      description: "Description",
      size: "Size (cm)",
      quality: "Quality*",
      grade: "Grade:",
      weight: "Weight (kg)",
      pieces: "Pieces",
      expiry_date: "Expiry Date",
      publish: "Publish",
      duplicate: "Duplicate",
      duplicate_successful_message:
        "Item with inventory number '{{inventoryNo}}' was created ",
      labels: "Labels",
      condition: "Condition:",
      donation: "CAS#",
      location: "Location*",
      inventory: "Inventory#",
      print: "& Print {{labels}}",
      printer: "Printer",
      value: "Value (HK$)",
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
        description: "English Description cannot be blank.",
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
    }
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
    title: "CAS#"
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
    cancel_user_warning: "你將會遺失所有資料。你確定要取消這用戶嗎?",
    image: "圖片",
    title: "職位",
    add_image: "添加圖片",
    edit_image: "修改圖片",
    delete_image: "刪除圖片",
    disabled: "Disabled",
    roles: "Roles",
    organisation: "機構",
    create_new_user: "添加新用戶",
    first_name: "名",
    last_name: "姓",
    mobile: "手提電話號碼",
    email: "電郵",
    district: "地區",
    preferred_language: "偏好語言",
    languages: {
      unknown: "未知",
      english: "英文",
      chinese: "中文"
    },
    registered_on: "註冊於",
    last_connected_on: "最後上線於",

    details: {
      last_on_goodcity: "好人好市最後上線",
      contact_details: "聯絡資料",
      staff_roles: "職員/ 義工身份",
      stock_app: "倉儲程式",
      admin_app: "管理程式",
      disable_user_account: "停用用戶帳號",
      merge_user_account: "與另一帳戶合併",
      disable_user: "停用用戶",
      disabled_user_info: "用戶會被禁止使用所有程式，包括捐贈程式。",
      disabled_user_note:
        " 注意：你可以從已停用的用戶帳號中移除電話號碼及電郵地址。此功能的作用為更正重複的號碼，而且不會將舊有紀錄轉移到新用戶帳號中。",
      re_enable_user_account: "重新啟用用戶帳號",
      enabled_user_info: "所有存取權限會被保留",
      enabled_user_note:
        "注意：如你不希望此用戶保留舊有權限或慈善機構員工身份，請變更他的存取權限。",
      enable_user: "重新啟用用戶",
      re_enable: "重新啟用",
      account_disabled: "帳號已停用",
      warning: "Warning!",
      missing_user_details_warning:
        "This user does not have valid email and mobile number. Please update user details from contact details page before re-enabling."
    },

    contact_details: {
      title: "聯絡資料",
      unauthorised_error: "抱歉，你未獲授權更改此用戶資料."
    },

    charity_position: {
      add_charity_position: "新增職位",
      position: "職位",
      status: "狀態",
      preferred_number: "聯絡電話號碼",
      cancel_warning: "你將會遺失所有資料。你確定要取消嗎？",
      validation_errors: {
        preferred_number: "請提供聯絡號碼",
        organisation: "機構名稱不能留空"
      }
    },

    roles: {
      admin_app_details: "管理程式詳情",
      unauthorised_error: "抱歉，你未獲授權更新此用戶身份。",
      access_status_for: "授權狀況",
      no_access: "沒有權限",
      access_until: "獲授權至",
      access_forever: "獲永久授權",
      roles_for_offers: "賦予處理捐贈的職務",
      reviewer: "審核員",
      reviewer_role_info: "此職務為審核捐贈",
      supervisor: "主管",
      supervisor_role_info: "此職務為管理捐贈",
      admin_role_error: "必須獲授權最少一個職務方可存取管理程式",
      admin_printer_label: "管理程式的偏好打印機",
      stock_app_details: "倉儲程式詳情",
      stock_role_error: "必須獲授權最少一個職務方可存取倉儲程式",
      stock_printer_label: "倉儲程式的偏好打印機",
      role_for_orders: "賦予處理訂單的職務",
      role_for_stock: "賦予處理貨物的職務",
      order_fulfilment_role: "訂單執行員",
      order_fulfilment_role_info: "此職務為審核訂單",
      order_administrator_role: "訂單管理員",
      order_administrator_role_info: "此職務為管理訂單",
      stock_fulfilment_role: "貨物執行員",
      stock_fulfilment_role_info: "此職務為審核貨物",
      stock_administrator_role: "貨物管理員",
      stock_administrator_role_info: "此職務為管理貨物"
    }
  },

  no_permission: {
    welcome: "Welcome!",
    logout: "Logout",
    login_msg:
      "You have successfully Logged in! However, you need permission to start working on stock.",
    manager_msg: "Ask your manager to grant permissions and then try again",
    try_again: "Try again"
  },

  merge_user: {
    merge: "合併",
    keep_details: "保留這些資料",
    user_id: "使用者帳號",
    email: "電郵地址",
    mobile: "手提電話號碼",
    first_name: "名字",
    last_name: "姓氏",
    choose_user: "選擇需要保留的使用者",
    merge_user_info:
      "合併後的帳戶會獲得兩個帳戶的所有權利、擁有權及團體職員身份等。",
    merge_user: "合併使用者"
  }
};
