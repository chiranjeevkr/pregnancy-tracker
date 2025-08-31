# AI Chatbot Setup Guide

## Integrating Google Gemini AI for Enhanced Maternal Health Consultation

The pregnancy tracker includes an advanced AI chatbot that can provide professional maternal health guidance. You can choose between:

1. **Built-in Medical Responses** (Default) - Comprehensive pre-programmed medical guidance
2. **Google Gemini AI Integration** (Enhanced) - Dynamic AI-powered responses

## Option 1: Built-in Medical Responses (Ready to Use)

The application comes with extensive built-in medical responses covering:
- Morning sickness and nausea management
- Exercise and physical activity guidelines
- Comprehensive nutrition guidance
- Common pregnancy symptoms (heartburn, constipation, discharge)
- Emergency symptom recognition
- Medication safety information

**No additional setup required** - the chatbot works immediately with professional medical guidance.

## Option 2: Google Gemini AI Integration (Enhanced Experience)

For dynamic, personalized AI responses, you can integrate with Google Gemini AI:

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder with your actual API key:
   ```
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

### Step 3: Restart the Server

```bash
npm run server
```

## Features of AI-Enhanced Chatbot

### Professional Medical Consultation
- Board-certified maternal-fetal medicine specialist persona
- Evidence-based responses following ACOG guidelines
- Structured medical advice with clear action steps
- Emergency symptom recognition and immediate care guidance

### Comprehensive Coverage
- **Pregnancy Symptoms**: Nausea, headaches, back pain, swelling
- **Nutrition**: Essential nutrients, food safety, calorie needs
- **Exercise**: Safe activities, warning signs, modifications
- **Complications**: Preeclampsia, gestational diabetes, preterm labor
- **Medications**: Safety profiles, dosing, alternatives
- **Fetal Development**: Movement patterns, growth concerns

### Safety Features
- Immediate emergency care recommendations for urgent symptoms
- Clear differentiation between normal and concerning symptoms
- Professional medical disclaimers
- Guidance on when to contact healthcare providers

## Medical Disclaimer

The AI chatbot provides general medical information based on current obstetric guidelines and evidence-based practices. This is not a substitute for professional medical care. Always consult your healthcare provider for:

- Personalized medical advice
- Urgent or concerning symptoms
- Medication changes
- Pregnancy complications
- Regular prenatal care

## Cost Considerations

- **Built-in Responses**: Free - no additional costs
- **Gemini AI**: Pay-per-use pricing from Google
  - Typically very affordable for personal use
  - Check current pricing at [Google AI Pricing](https://ai.google.dev/pricing)

## Troubleshooting

If Gemini AI integration fails:
1. Check your API key is correct
2. Verify internet connection
3. The system automatically falls back to built-in responses
4. Check server logs for specific error messages

## Support

For technical issues or questions about the AI integration, please refer to the main README.md or create an issue in the repository.