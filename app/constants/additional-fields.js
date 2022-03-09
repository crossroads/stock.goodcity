export default {
  additionalFields: [
    {
      label: "Test Status",
      name: "compTestStatus",
      type: "text",
      autoComplete: true,
      category: ["computer", "computer_accessory"],
      addAble: false
    },
    {
      label: "Test Status",
      name: "testStatus",
      type: "text",
      autoComplete: true,
      category: ["electrical"],
      addAble: false
    },
    {
      label: "Brand",
      name: "brand",
      type: "text",
      autoComplete: true,
      category: ["computer", "computer_accessory", "electrical", "medical"],
      addAble: true
    },
    {
      label: "Model",
      name: "model",
      type: "text",
      autoComplete: false,
      value: "model",
      category: ["computer", "computer_accessory", "electrical", "medical"],
      addAble: false
    },
    {
      label: "Serial Number",
      name: "serialNum",
      type: "text",
      value: "serialNum",
      autoComplete: false,
      category: ["computer", "computer_accessory"],
      addAble: false
    },
    {
      label: "Country of origin",
      name: "country",
      type: "number",
      autoComplete: true,
      category: ["computer", "computer_accessory", "electrical", "medical"],
      addAble: false
    },
    {
      label: "Size",
      name: "size",
      type: "text",
      autoComplete: true,
      category: ["computer", "computer_accessory"],
      addAble: true
    },
    {
      label: "CPU",
      name: "cpu",
      type: "text",
      autoComplete: true,
      category: ["computer"],
      addAble: true
    },
    {
      label: "RAM",
      name: "ram",
      type: "text",
      autoComplete: true,
      category: ["computer"],
      addAble: true
    },
    {
      label: "HDD",
      name: "hdd",
      type: "text",
      autoComplete: true,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Optical",
      name: "optical",
      type: "text",
      autoComplete: true,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Video",
      name: "video",
      type: "text",
      autoComplete: true,
      category: ["computer"],
      addAble: true
    },
    {
      label: "LAN",
      name: "lan",
      type: "text",
      autoComplete: true,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Voltage",
      name: "compVoltage",
      type: "text",
      autoComplete: true,
      category: ["computer", "computer_accessory"],
      addAble: false
    },
    {
      label: "OS",
      name: "os",
      type: "text",
      autoComplete: true,
      category: ["computer"],
      addAble: true
    },
    {
      label: "Existing COA",
      name: "osSerialNum",
      type: "text",
      autoComplete: false,
      value: "osSerialNum",
      category: ["computer"],
      addAble: false
    },
    {
      label: "MS Office Serial Num",
      name: "msOfficeSerialNum",
      type: "text",
      value: "msOfficeSerialNum",
      autoComplete: false,
      category: ["computer"],
      addAble: false
    },
    {
      label: "MRR COA ID",
      name: "marOsSerialNum",
      type: "text",
      value: "marOsSerialNum",
      autoComplete: false,
      category: ["computer"],
      addAble: false
    },
    {
      label: "MRR Office COA ID",
      name: "marMsOfficeSerialNum",
      type: "text",
      value: "marMsOfficeSerialNum",
      autoComplete: false,
      category: ["computer"],
      addAble: false
    },
    {
      label: "Interface",
      name: "interface",
      type: "text",
      autoComplete: true,
      category: ["computer_accessory"],
      addAble: true
    },
    {
      label: "Voltage",
      name: "voltage",
      type: "number",
      autoComplete: true,
      category: ["electrical"],
      addAble: false
    },
    {
      label: "Frequency",
      name: "frequency",
      type: "number",
      autoComplete: true,
      category: ["electrical"],
      addAble: false
    },
    {
      label: "Serial Number",
      name: "serialNumber",
      type: "text",
      value: "serialNumber",
      autoComplete: false,
      category: ["electrical", "medical"],
      addAble: false
    },
    {
      label: "Power",
      name: "power",
      type: "text",
      autoComplete: false,
      value: "power",
      category: ["electrical"],
      addAble: true
    },
    {
      label: "System or Region",
      name: "systemOrRegion",
      type: "text",
      autoComplete: false,
      value: "systemOrRegion",
      category: ["electrical"],
      addAble: true
    },
    {
      label: "Standard",
      name: "standard",
      type: "text",
      autoComplete: false,
      value: "standard",
      category: ["electrical"],
      addAble: true
    }
  ]
};
