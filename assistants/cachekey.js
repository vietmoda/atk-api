const cacheurl = require("../config/config.cacheurl.json");

//Lấy thông tin roleID theo url
const getroleid = async (method, url) => {
  try {
    for (let i = 0; i < cacheurl.length; i++) {
      if (cacheurl[i].method == method && cacheurl[i].apiurl == url) {
        return cacheurl[i].roleid;
      }
    }
  } catch (error) {
    console.log(error);
    return "none";
  }
};

//Lấy thông tin roleID theo url
const getcacheobject = async (method, url) => {
  try {
    for (let i = 0; i < cacheurl.length; i++) {
      const indexof = url.indexOf(cacheurl[i].apiurl);
      if (cacheurl[i].method == method && indexof > -1) {
        return cacheurl[i];
      }
    }
  } catch (error) {
    console.log(error);
    return {};
  }
};

//Lấy thông tin full của cả prefixcachekey và url api để làm key lưu cache
const getcachekey = async (requestapiurl) => {
  try {
    for (let i = 0; i < cacheurl.length; i++) {
      const indexof = requestapiurl.indexOf(cacheurl[i].apiurl);
      if (indexof > -1) {
        return `${cacheurl[i].prefixcachekey}_${requestapiurl}`;
      }
    }
  } catch (error) {
    console.log(error);
    return "none";
  }
};

//Lấy thông tin prefixcachekey để trả ngược về sau khi thực hiện các phương thức POST, PUT, DELETE thành công
const getprefixbyurl = async (requestapiurl) => {
  try {
    for (let i = 0; i < cacheurl.length; i++) {
      const indexof = requestapiurl.indexOf(cacheurl[i].apiurl);
      if (indexof > -1) {
        return cacheurl[i].prefixcachekey;
      }
    }
  } catch (error) {
    console.log(error);
    return "none";
  }
};

//Từ thông tin URL API và Method để lấy ra roleid tương ứng

module.exports = {
  getcachekey,
  getprefixbyurl,
  getroleid,
  getcacheobject,
};
