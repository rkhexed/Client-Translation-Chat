from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import MBartForConditionalGeneration, MBartTokenizer
import uvicorn

# Initialize FastAPI app
app = FastAPI()

# Loading the mBART model and tokenizer
model_name = "facebook/mbart-large-50-many-to-many-mmt"
tokenizer = MBartTokenizer.from_pretrained(model_name)
model = MBartForConditionalGeneration.from_pretrained(model_name)

# Set the model to evaluation mode
model.eval()

# Data validation using Pydantic
class TranslationRequest(BaseModel):
    text: str
    source_lang: str  # Language code for source text
    target_lang: str  # Language code for target text

# Utility function to translate text
def translate_text(text: str, src_lang: str, tgt_lang: str):
    try:
        tokenizer.src_lang = src_lang
        inputs = tokenizer(text, return_tensors="pt")
        generated_tokens = model.generate(
            **inputs, 
            forced_bos_token_id=tokenizer.lang_code_to_id[tgt_lang]
        )
        translated_text = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
        return translated_text
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# POST method for translation
@app.post("/translate/")
def translate(request: TranslationRequest):
    translation = translate_text(request.text, request.source_lang, request.target_lang)
    return {"translated_text": translation}

# To get FastAPI server running
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
