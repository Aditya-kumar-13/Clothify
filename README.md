# 🧠 Clothify — Visual Fashion Recommendation Engine

Clothify is a full-stack application that allows users to upload an image (e.g., a fashion item), automatically generates a descriptive caption using BLIP (Bootstrapped Language-Image Pretraining), scrapes relevant product listings based on that caption using Playwright, and presents them in a beautiful frontend interface.

## 🎥 Demo

https://github.com/user-attachments/assets/8e62e89f-626f-4262-a5e3-1d845ecef009

---

## ✨ Features

- 📸 **Image to Text**: Uses [Salesforce BLIP](https://huggingface.co/Salesforce/blip-image-captioning-base) to generate natural-language captions from uploaded images.
- 🔍 **Automated Scraping**: Uses [Playwright](https://playwright.dev/) to search e-commerce websites and extract relevant results.
- ⚡ **Fast API Backend**: Built with Express and Python to bridge the image model and browser automation.
- 🌐 **Frontend Integration**: Results are displayed dynamically in a sleek web interface (hosted on Vercel).

---

## 📁 Project Structure

```bash
.
├── backend/
│   ├── blip.py              # Python script for image captioning using BLIP
│   ├── scrape.js            # Node script using Playwright for scraping
│   ├── server.js            # Express server for handling image uploads and scraping
│   ├── .env                 # Environment variables (e.g., allowed CORS origins)
│
├── frontend/
│   └── ...                  # Your frontend code (React/Next.js, hosted on Vercel)
│
├── public/
│   └── demo.mp4             # (Optional) Demo video for README or homepage
