import block from "./block";
import properties from "./properties";

const Plugin = (editor) => {
  const id = process.env.MODULE_ID;
  editor.BlockManager.add(id, block);
  editor.DomComponents.addType(id, properties);
};

export default Plugin;
