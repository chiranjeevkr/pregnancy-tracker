import React from 'react';
import { Typography, Card, CardContent, Box, Chip } from '@mui/material';
import { FitnessCenter, AccessTime, Warning } from '@mui/icons-material';

const Exercise = ({ user }) => {
  const getExercisesByTrimester = (week) => {
    if (week <= 12) {
      return {
        trimester: 'First Trimester',
        exercises: [
          {
            name: 'Walking',
            duration: '20-30 minutes',
            description: 'Gentle walking is perfect for maintaining cardiovascular health.',
            benefits: ['Improves circulation', 'Reduces nausea', 'Boosts energy'],
            precautions: ['Stay hydrated', 'Avoid overheating']
          },
          {
            name: 'Prenatal Yoga',
            duration: '15-30 minutes',
            description: 'Gentle stretches and breathing exercises.',
            benefits: ['Reduces stress', 'Improves flexibility', 'Better sleep'],
            precautions: ['Avoid deep twists', 'No lying on back']
          },
          {
            name: 'Swimming',
            duration: '20-30 minutes',
            description: 'Low-impact exercise that supports your growing body.',
            benefits: ['Full body workout', 'Reduces joint stress', 'Cooling effect'],
            precautions: ['Avoid diving', 'Use handrails']
          }
        ]
      };
    } else if (week <= 28) {
      return {
        trimester: 'Second Trimester',
        exercises: [
          {
            name: 'Brisk Walking',
            duration: '30-45 minutes',
            description: 'Increase intensity as energy levels improve.',
            benefits: ['Strengthens legs', 'Improves stamina', 'Weight management'],
            precautions: ['Wear supportive shoes', 'Avoid uneven terrain']
          },
          {
            name: 'Prenatal Pilates',
            duration: '30-45 minutes',
            description: 'Strengthen core and improve posture.',
            benefits: ['Core strength', 'Better posture', 'Reduces back pain'],
            precautions: ['Modify as belly grows', 'Avoid supine positions']
          },
          {
            name: 'Stationary Cycling',
            duration: '20-30 minutes',
            description: 'Safe cardiovascular exercise with back support.',
            benefits: ['Leg strength', 'Cardiovascular health', 'Low impact'],
            precautions: ['Adjust seat height', 'Moderate intensity']
          },
          {
            name: 'Light Weight Training',
            duration: '20-30 minutes',
            description: 'Maintain muscle strength with lighter weights.',
            benefits: ['Muscle maintenance', 'Bone health', 'Metabolism boost'],
            precautions: ['Avoid heavy lifting', 'Focus on form']
          }
        ]
      };
    } else {
      return {
        trimester: 'Third Trimester',
        exercises: [
          {
            name: 'Gentle Walking',
            duration: '15-30 minutes',
            description: 'Maintain activity with shorter, gentler walks.',
            benefits: ['Prepares for labor', 'Reduces swelling', 'Improves mood'],
            precautions: ['Listen to your body', 'Rest when needed']
          },
          {
            name: 'Prenatal Yoga',
            duration: '15-30 minutes',
            description: 'Focus on breathing and gentle stretches.',
            benefits: ['Relaxation', 'Pain relief', 'Labor preparation'],
            precautions: ['Use props for support', 'Avoid deep stretches']
          },
          {
            name: 'Pelvic Floor Exercises',
            duration: '10-15 minutes',
            description: 'Strengthen muscles for delivery and recovery.',
            benefits: ['Labor preparation', 'Faster recovery', 'Prevents incontinence'],
            precautions: ['Learn proper technique', 'Don\'t overdo it']
          },
          {
            name: 'Swimming (if comfortable)',
            duration: '15-25 minutes',
            description: 'Water supports your weight and reduces pressure.',
            benefits: ['Joint relief', 'Reduces swelling', 'Relaxation'],
            precautions: ['Use pool ladder', 'Avoid hot tubs']
          }
        ]
      };
    }
  };

  const exerciseData = getExercisesByTrimester(user.currentWeek);

  const generalPrecautions = [
    'Always consult your doctor before starting any exercise program',
    'Stop exercising if you feel dizzy, short of breath, or experience pain',
    'Stay hydrated and avoid overheating',
    'Avoid exercises lying flat on your back after first trimester',
    'Listen to your body and rest when needed'
  ];

  return (
    <div className="dashboard-container">
      <Typography variant="h4" gutterBottom className="text-dark">
        Exercise Guide - Week {user.currentWeek}
      </Typography>

      <Card sx={{ mb: 3, background: 'linear-gradient(45deg, #ff6b9d, #ffc1cc)', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {exerciseData.trimester}
          </Typography>
          <Typography variant="body1">
            Exercises tailored for your current stage of pregnancy
          </Typography>
        </CardContent>
      </Card>

      {exerciseData.exercises.map((exercise, index) => (
        <Card key={index} className="exercise-card">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FitnessCenter sx={{ color: '#ff6b9d', mr: 1 }} />
              <Typography variant="h6" className="text-dark">
                {exercise.name}
              </Typography>
              <Chip 
                icon={<AccessTime />}
                label={exercise.duration}
                size="small"
                sx={{ ml: 'auto', backgroundColor: '#ffc1cc' }}
              />
            </Box>

            <Typography variant="body1" paragraph className="text-dark">
              {exercise.description}
            </Typography>

            <Typography variant="h6" gutterBottom className="text-dark">
              Benefits:
            </Typography>
            <Box sx={{ mb: 2 }}>
              {exercise.benefits.map((benefit, idx) => (
                <Chip
                  key={idx}
                  label={benefit}
                  size="small"
                  sx={{ mr: 1, mb: 1, backgroundColor: '#e8f5e8' }}
                />
              ))}
            </Box>

            <Typography variant="h6" gutterBottom className="text-dark">
              Precautions:
            </Typography>
            <Box>
              {exercise.precautions.map((precaution, idx) => (
                <Chip
                  key={idx}
                  label={precaution}
                  size="small"
                  icon={<Warning />}
                  sx={{ mr: 1, mb: 1, backgroundColor: '#fff3cd' }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}

      <Card sx={{ mt: 3, backgroundColor: '#fff3cd' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom className="text-dark">
            ⚠️ General Exercise Precautions
          </Typography>
          {generalPrecautions.map((precaution, index) => (
            <Typography key={index} variant="body2" paragraph className="text-dark">
              • {precaution}
            </Typography>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Exercise;