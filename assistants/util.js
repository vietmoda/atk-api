//stringdate: DD/MM/YYYY
const todate = (stringdate) => {
  let dateparts = stringdate.split("/");
  let dateobject = new Date(+dateparts[2], dateparts[1] - 1, +dateparts[0]);
  return dateobject;
};

const timestamptodate = (timestamp) => {
  console.log(timestamp);
  const dateobj = new Date(timestamp);
  const isodatestring = dateobj.toISOString();
  const dateiso = new Date(isodatestring);
  return dateiso;
};

module.exports = {
  todate,
  timestamptodate,
};
