import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { generateCaption } from './blip.js';
import { runScraper } from './scrape.js';
import fs from 'fs/promises'; 
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import os from 'os';
import { v4 as uuidv4 } from 'uuid';

app.post('/recommend', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.jpg`);
  await fs.writeFile(tempFilePath, req.file.buffer);

  try {
    const caption = await generateCaption(tempFilePath);

    await fs.unlink(tempFilePath);

    res.json({
      message: 'Caption generated. Now searching...',
      caption
    });
  } catch (error) {
    console.error('Error in processing:', error);
    res.status(500).json({ message: 'Caption generation failed' });
  }
});

app.get('/scrape', async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const products = await runScraper(query);
    res.json({ products });
  } catch (error) {
    console.error('Error in scraping:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
