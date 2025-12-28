export class HuggingFaceProvider {
  private baseUrl = 'https://api-inference.huggingface.co/models';
  private token: string;
  
  constructor() {
    this.token = process.env.HUGGINGFACE_TOKEN || '';
    if (!this.token) {
      console.warn('⚠️ HuggingFace token not provided');
    }
  }
  
  async generate(request: any): Promise<any> {
    // استخدام نموذج نصي
    const model = 'facebook/mbart-large-50-many-to-many-mmt';
    
    const response = await fetch(`${this.baseUrl}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: request.prompt,
        parameters: {
          max_length: 500,
          temperature: request.temperature || 0.7
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      content: result[0]?.generated_text || '',
      tokens: result[0]?.details?.generated_tokens || 0,
      model: model
    };
  }
  
  async sentimentAnalysis(text: string, language: string = 'ar'): Promise<any> {
    const model = language === 'ar' 
      ? 'CAMeL-Lab/bert-base-arabic-camelbert-da-sentiment'
      : 'distilbert-base-uncased-finetuned-sst-2-english';
    
    const response = await fetch(`${this.baseUrl}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text })
    });
    
    if (!response.ok) {
      throw new Error(`Sentiment analysis failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    // تحويل النتيجة إلى تنسيق موحد
    const sentimentData = result[0] || [];
    const positiveScore = sentimentData.find((s: any) => s.label.toLowerCase().includes('positive'))?.score || 0;
    const negativeScore = sentimentData.find((s: any) => s.label.toLowerCase().includes('negative'))?.score || 0;
    
    let sentiment: string;
    let confidence: number;
    
    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      confidence = positiveScore;
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      confidence = negativeScore;
    } else {
      sentiment = 'neutral';
      confidence = 0.5;
    }
    
    return {
      sentiment,
      confidence: parseFloat(confidence.toFixed(3)),
      scores: {
        positive: positiveScore,
        negative: negativeScore
      },
      model: model
    };
  }
  
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    const model = 'facebook/mbart-large-50-many-to-many-mmt';
    
    const response = await fetch(`${this.baseUrl}/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          src_lang: sourceLang,
          tgt_lang: targetLang
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result[0]?.translation_text || text;
  }
}