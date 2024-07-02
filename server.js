const express = require("express");
const geoip = require("geoip-lite");
const axios = require("axios");
const http = require("http");
const { networkInterfaces } = require("os");

const app = express();

const API_KEY = "267c3db5cc888e0ca04c60c7f8172c2a";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";


const getServerIp = () => {
  const nets = networkInterfaces();
  let ipAddress = "";

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        ipAddress = net.address;
      }
    }
  }

  return ipAddress;
};

const getTemperature = async (lat, lon) => {
  try {
    const response = await axios.get(
      `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    return response.data.main.temp;
  } catch (error) {
    console.error("Error fetching temperature:", error);
    return null;
  }
};

app.get("/api/hello", async (req, res) => {
  const visitorName = req.query.visitor_name || "Guest";
  const serverIp = getServerIp();
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  
  const ipToLookup =
    clientIp !== "::1" && clientIp !== serverIp ? clientIp : "207.97.227.239"; 
    
    console.log(ipToLookup);
  const location = geoip.lookup(ipToLookup);

  if (location) {
    const {
      city,
      ll: [lat, lon],
    } = location;
    const temperature = await getTemperature(lat, lon);

    if (temperature !== null) {
      const greeting = `Hello, ${visitorName}! The temperature is ${temperature}°C in ${city}.`;
      res.json({ client_ip: clientIp, location: city, greeting });
    } else {
      res
        .status(500)
        .json({ error: "Unable to fetch temperature at this time." });
    }
  } else {
    res
      .status(404)
      .json({ error: "Location not found for the provided IP address." });
  }
});

const server = http.createServer(app);

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});
