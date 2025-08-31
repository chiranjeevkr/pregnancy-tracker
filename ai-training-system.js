// AI Training System for Continuous Learning
const mongoose = require('mongoose');

// Schema for collecting training data
const trainingDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userQuestion: { type: String, required: true },
  aiResponse: { type: String, required: true },
  userFeedback: { 
    type: String, 
    enum: ['helpful', 'not_helpful', 'partially_helpful'],
    default: null 
  },
  userContext: {
    pregnancyWeek: Number,
    trimester: Number,
    recentSymptoms: [String],
    healthScore: Number,
    mood: String
  },
  responseAccuracy: { type: Number, min: 1, max: 5 }, // 1-5 rating
  improvementSuggestions: String,
  timestamp: { type: Date, default: Date.now }
});

const TrainingData = mongoose.model('TrainingData', trainingDataSchema);

// Function to collect training data
async function collectTrainingData(userId, question, response, userContext) {
  try {
    const trainingEntry = new TrainingData({
      userId,
      userQuestion: question,
      aiResponse: response,
      userContext
    });
    await trainingEntry.save();
    return trainingEntry._id;
  } catch (error) {
    console.error('Error collecting training data:', error);
  }
}

// Function to update training data with user feedback
async function updateTrainingFeedback(trainingId, feedback, accuracy, suggestions) {
  try {
    await TrainingData.findByIdAndUpdate(trainingId, {
      userFeedback: feedback,
      responseAccuracy: accuracy,
      improvementSuggestions: suggestions
    });
  } catch (error) {
    console.error('Error updating training feedback:', error);
  }
}

// Function to analyze training data for improvements
async function analyzeTrainingData() {
  try {
    const analysis = await TrainingData.aggregate([
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$responseAccuracy' },
          totalResponses: { $sum: 1 },
          helpfulResponses: {
            $sum: { $cond: [{ $eq: ['$userFeedback', 'helpful'] }, 1, 0] }
          },
          commonQuestions: { $push: '$userQuestion' }
        }
      }
    ]);
    
    return analysis[0] || {};
  } catch (error) {
    console.error('Error analyzing training data:', error);
    return {};
  }
}

// Function to get personalized response patterns
async function getPersonalizedPatterns(userId) {
  try {
    const userPatterns = await TrainingData.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    // Analyze user's common questions and preferred response styles
    const questionTypes = {};
    const preferredResponseLength = [];
    
    userPatterns.forEach(entry => {
      // Categorize questions
      const question = entry.userQuestion.toLowerCase();
      if (question.includes('nausea') || question.includes('sick')) {
        questionTypes.nausea = (questionTypes.nausea || 0) + 1;
      }
      if (question.includes('exercise') || question.includes('workout')) {
        questionTypes.exercise = (questionTypes.exercise || 0) + 1;
      }
      if (question.includes('food') || question.includes('eat')) {
        questionTypes.nutrition = (questionTypes.nutrition || 0) + 1;
      }
      
      // Track response length preferences
      if (entry.userFeedback === 'helpful') {
        preferredResponseLength.push(entry.aiResponse.length);
      }
    });
    
    return {
      commonQuestionTypes: questionTypes,
      avgPreferredResponseLength: preferredResponseLength.length > 0 
        ? preferredResponseLength.reduce((a, b) => a + b, 0) / preferredResponseLength.length 
        : 500,
      totalInteractions: userPatterns.length
    };
  } catch (error) {
    console.error('Error getting personalized patterns:', error);
    return {};
  }
}

module.exports = {
  TrainingData,
  collectTrainingData,
  updateTrainingFeedback,
  analyzeTrainingData,
  getPersonalizedPatterns
};