async function returnData(lat: number, lon: number) {
  var url = "https://en.wikipedia.org/w/api.php";

  const params = {
    action: "query",
    generator: "geosearch",
    prop: "coordinates|pageimages",
    ggscoord: `${lat}|${lon}`,
    ggsradius: 10000,
    ggslimit: 10,
    format: "json",
  };

  url = url + "?origin=*";
  Object.keys(params).forEach(function (key) {
    url += "&" + key + "=" + params[key];
  });

  const dataArray: any = [];

  try {
    const response = await fetch(url);
    const data = await response.json();
    for (var key in data.query.pages) {
      dataArray.push(data.query.pages[key]);
    }
  } catch (error) {
    console.log(error);
  }

  return dataArray;
}

export default returnData;
