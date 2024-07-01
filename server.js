const express = require('express');
const geoip = require('geoip-lite');
const axios = require('axios');

const app = express();

const API_KEY = "267c3db5cc888e0ca04c60c7f8172c2a";
const BASE_URL = "api.openweathermap.org/data/2.5/weather";

const getTemperature = async (location) => {

  const lat = location.ll[0]
  const lon = location.ll[1]
  const response = await axios.get(`https://${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);

  const temperature = response.data.main.temp;
  return temperature;
  };
  
  app.get('/api/hello', async (req, res) => {
    
    const visitorName = req.query.visitor_name;
    const clientIp = req.ip;
    console.log(req.ip)
    // const ip = "207.97.227.239";
    const location = geoip.lookup(clientIp);
  const temperature = await getTemperature(location);
  const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celcius in ${location.city}`;
  console.log(greeting);
  res.json({ client_ip: clientIp, location: location.city, greeting });
});

app.listen(3001, () => {
  console.log('Server listening on port 3001');
});