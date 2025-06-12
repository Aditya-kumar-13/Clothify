import sys
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
import torch

def generate_caption(image_path):
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

    image = Image.open(image_path).convert('RGB')
    inputs = processor(image, return_tensors="pt")

    with torch.no_grad():
        output = model.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)
    return caption

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python blip.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    caption = generate_caption(image_path)
    print(caption)
