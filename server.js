const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const axios = require('axios');

// Constants for Google Sheets
const SHEET_ID = '1QlWOoMdhaz90UzENm-o6kNdraV1HQHoiDrYaNPJeyq8';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

// Function to add a new project to Google Sheet
async function addProjectToSheet(project) {
    try {
        // This is a placeholder for the actual Google Sheets API implementation
        // You'll need to:
        // 1. Set up Google Sheets API credentials
        // 2. Use google-spreadsheet npm package
        // 3. Authenticate and append the row
        
        console.log('Adding project to sheet:', project);
        return true;
    } catch (error) {
        console.error('Error adding project to sheet:', error);
        throw error;
    }
}

// Add body parser middleware for Telegram webhook
app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Something broke!');
});

// Add request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the root path
app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Add a specific route for shop.html
app.get('/shop.html', (req, res) => {
    console.log('Serving shop.html');
    res.sendFile(path.join(__dirname, 'shop.html'));
});

// API endpoint to fetch projects from Google Sheets
app.get('/api/projects', async (req, res) => {
    try {
        const response = await axios.get(SHEET_URL);
        
        // Google Sheets returns data in a specific format that needs parsing
        // Remove the Google Visualization API prefix
        const jsonString = response.data.substring(47).slice(0, -2);
        const data = JSON.parse(jsonString);
        
        // Transform the data into a more usable format
        const projects = data.table.rows
            .slice(1) // Skip the header row
            .map(row => {
                const cells = row.c;
                // Only return if we have valid data
                if (cells && cells[0]?.v && cells[1]?.v) {
                    return {
                        title: cells[0]?.v || '',
                        description: cells[1]?.v || '',
                        imageUrl: cells[2]?.v || '',
                        linkUrl: cells[3]?.v || ''
                    };
                }
                return null;
            })
            .filter(project => project !== null); // Remove any null entries
        
        // No need to sort if order column is not present
        // Projects will be displayed in the order they appear in the sheet
        
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Telegram webhook endpoint
app.post('/webhook/telegram', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.sendStatus(200);
        }

        const chatId = message.chat.id;
        const text = message.text;

        // Check if the message contains a URL
        if (text && text.startsWith('http')) {
            // Here you would typically:
            // 1. Validate the URL
            // 2. Add it to your Google Sheet
            // 3. Send a confirmation message
            
            // For now, we'll just acknowledge receipt
            await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "Thank you for your submission! The project will be reviewed and added to the shop."
            });
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error handling Telegram webhook:', error);
        res.sendStatus(500);
    }
});

// API endpoint to add new projects
app.post('/api/projects', async (req, res) => {
    try {
        const { title, description, imageUrl, linkUrl } = req.body;
        
        // Here you would typically:
        // 1. Validate the input
        // 2. Add the project to your Google Sheet
        // 3. Return success response
        
        res.json({ success: true, message: 'Project added successfully' });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ error: 'Failed to add project' });
    }
});

// API endpoint to receive data from Telegram bot
app.post('/api/add-project', async (req, res) => {
    try {
        const { title, description, imageUrl, linkUrl } = req.body;

        // Validate required fields
        if (!title || !linkUrl) {
            return res.status(400).json({ 
                error: 'Missing required fields. Need at least title and linkUrl.' 
            });
        }

        const project = {
            title,
            description: description || '',
            imageUrl: imageUrl || '',
            linkUrl
        };

        // Try to add the project to the sheet
        await addProjectToSheet(project);

        // Send success response
        res.json({ 
            success: true, 
            message: 'Project added successfully to Google Sheet',
            data: project
        });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ error: 'Failed to add project' });
    }
});

// Get local IP address
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('To access from other devices on your network, use one of these addresses:');
    Object.keys(results).forEach((key) => {
        results[key].forEach((ip) => {
            console.log(`http://${ip}:${port}`);
        });
    });
}); 