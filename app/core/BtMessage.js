const BtMessage = function ({corr_id, type, payload}) {
  this.type = type;
  this.corr_id = corr_id
  this.payload = jsonOrText(payload)
  this.has = (body_param) => {
    return !!this.body[body_param];
  }
  this.toJson = () => {
    return JSON.stringify({type:this.type,corr_id:this.corr_id,payload: this.payload})
  }
}

function jsonOrText(str = null) {
  if (!str)
    return {}
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}


export default BtMessage;
