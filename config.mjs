import dotenv from "dotenv";
import path from "path";

dotenv.config(path.resolve(".env"));

export default {
  ...process.env,
  ADMIN_ADDRESS: {
    56: undefined,
    97: process.env.ADMIN_ADDRESS_97,
    1337: process.env.ADMIN_ADDRESS_1337,
  },
  FACTORY_ADDRESS: {
    56: process.env.IDSWAPP_FACTORY_ADDRESS_56,
    97: process.env.IDSWAPP_FACTORY_ADDRESS_97,
    1337: process.env.IDSWAPP_FACTORY_ADDRESS_1337,
  },
}
