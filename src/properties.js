import script from "./script";

const properties = {
  isComponent: (el) => el.id === process.env.MODULE_ID,
  model: {
    defaults: {
      script,
      isEdit: false,
      traits: [
        {
          type: "checkbox",
          label: "Edit Mode",
          name: "isEdit",
          changeProp: 1,
        },
        {
          type: "text",
          label: "UD callback url",
          name: "udCallback",
          changeProp: 2,
        },
        {
          type: "text",
          label: "UD app Id",
          name: "udAppId",
          changeProp: 3,
        },
      ],
      "script-props": ["isEdit", "udCallback", "udAppId"],
    },
  },
};

export default properties;
