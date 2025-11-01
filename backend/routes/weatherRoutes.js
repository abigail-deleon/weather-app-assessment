const express = require('express');
const router = express.Router();
const axios = require('axios');
const WeatherSearch = require('../models/WeatherSearch');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'http://api.openweathermap.org/data/2.5';

// Validate Location helper
async function validateLocation(location) {
    try {
        const response = await axios.get(
            `${BASE_URL}/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`
        );
        return response.data;
    } catch (error){
        throw new Error('Invalid location');
    }
}

// Create - Save weather search
router.post('/searches', async (requestAnimationFrame, res) => {
    try{
        const { location, startDate, endDate } = req.body;

        //Validate location exists
        const weatherData = await validateLocation(location);

        //Create new search record
        const newSearch = new WeatherSearch({
            location: weatherData.name,
            startDate: startDate || null,
            endDate: endDate || null,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed,
            feelsLike: weatherData.main.feels_like,
            country: weatherData.sys.country,
            icon: weatherData.weather[0].icon
        });

        await newSearch.save();

        res.status(201).json({
            success: true,
            message: 'Weather search saved successfully',
            data: newSearch,
            weatherData: weatherData
        });
    } catch (error) {
        res.status(400).json({
                success: false,
                error: error.message
        });
    }
});

// READ - Get single search by ID
router.get('/searches/:id', async (req, res) => {
    try{
        const search = await WeatherSearch.findById(req.params.id);
        if (!search) {
            return res.status(404).json({
                success: false,
                error: 'Search not found'
            });
        } 
    }catch (error){
        res.json({
            success: false,
            error: error.message
        });
    }
});

// UPDATE - Update search
router.put('/searches/:id', async (req, res) => {
    try {
        const { location, startDate, endDate } = req.body;
        const search = await WeatherSearch.findById(req.params.id);

        if(!search){
            return res.status(404).json({
                success: false,
                error: 'Search not found'
            });
        }

        // If location changed, validate and fetch new data
        if (location && location !== search.location){
            const weatherData = await validateLocation(location);

            search.location = weatherData.name;
            search.temperature = weatherData.main.temp;
            search.description = weatherData.weather[0].description;
            search.humidity = weatherData.main.humidity;
            search.windSpeed = weatherData.wind.speed;
            search.feelsLike = weatherData.main.feels_like;
            search.country = weatherData.sys.country;
            search.icon = weatherData.weather[0].icon;
        }

        //Update dates
        if (startDate !== undefined) search.startDate = startDate || null;
        if (endDate !== undefined) search.endDate = endDate || null;

        res.json({
            success: true,
            message: 'Search updated successfully',
            data: search
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE - Delete search
router.delete('/searches/:id', async (req, res) => {
    try {
        const search = await WeatherSearch.findByIdAndDelete(req.params.id);

        if (!search) {
            return res.status(404).json({
                success: false,
                error: 'Search not found'
            });
        }

        res.json({
            success: true,
            message: 'Seatch deleted successfully'
        });
    } catch (error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get current weather (no save)
router.post('/weather/current', async (req, res) => {
    try {
        const { location } = req.body;
        const weatherData = await validateLocation(location);

        res.json({
            success: true,
            data: weatherData
        });
    } catch (error) {
        res.status(400).json({
            success: failure,
            error: error.message
        });
    }
});

// Get 5-day forecast
router.post('/weather/forecast', async (req, res) => {
    try {
        const { location } = req.body;
        const response = await axios.get(
            `${BASE_URL}/forecast?q=${location}&appid=${WEATHER_API_KEY}&units=metric`
        );

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: 'Could not fetch forecast'
        });
    }
});

module.exports = router;

