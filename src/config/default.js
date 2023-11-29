

require('dotenv').config()
const config={
  LOCSL_CLIENT:process.env.LOCAL_CLIENT,
  CLIENT_APP:process.env.CLIENT_APP
}
module.exports=config