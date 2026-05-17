async function test() {
  const latitude = 37.3197;
  const longitude = 127.0940;
  const acceptLang = 'ko';
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=${acceptLang}`,
    { headers: { 'User-Agent': 'ClickDay Application' } }
  );
  const data = await response.json();
  
  const country = data.address.country;
  const province = data.address.province || data.address.state || data.address.region;
  const cityName = data.address.city || data.address.town || data.address.borough || data.address.county;
  const suburb = data.address.suburb || data.address.quarter || data.address.neighbourhood;
  console.log(data.address);
  console.log({ country, province, cityName, suburb });
}
test();
