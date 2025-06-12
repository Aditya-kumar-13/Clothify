import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { generateCaption } from './blip.js';
import { runScraper } from './scrape.js'; 

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/recommend', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const imagePath = path.join(process.cwd(), req.file.path);

  try {
    const caption = await generateCaption(imagePath);
    res.json({
      message: 'Caption generated. Now searching...',
      caption
    });

    const products = await runScraper(caption);
    console.log('Scraped Products:', products);

  } catch (error) {
    console.error('Error in processing:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
