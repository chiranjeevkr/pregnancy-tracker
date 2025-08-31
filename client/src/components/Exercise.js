import React from 'react';
import { Typography, Card, CardContent, Box, Chip } from '@mui/material';
import { FitnessCenter, AccessTime, Warning } from '@mui/icons-material';
import SharedNavigation from './SharedNavigation';

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
            precautions: ['Stay hydrated', 'Avoid overheating', 'Stop if you feel dizzy', 'Wear supportive shoes', 'Avoid uneven terrain'],
            instructions: [
              'Start with 10-15 minutes if you\'re new to exercise',
              'Maintain a pace where you can still hold a conversation',
              'Wear comfortable, supportive shoes',
              'Choose flat, even surfaces to avoid falls',
              'Swing your arms naturally for balance'
            ]
          },
          {
            name: 'Prenatal Yoga',
            duration: '15-30 minutes',
            description: 'Gentle stretches and breathing exercises.',
            benefits: ['Reduces stress', 'Improves flexibility', 'Better sleep'],
            precautions: ['Avoid deep twists', 'No lying on back', 'Don\'t overstretch', 'Stop if you feel pain', 'Avoid hot yoga'],
            instructions: [
              'Start in a comfortable seated position',
              'Focus on deep, slow breathing',
              'Move slowly between poses',
              'Use props (pillows, blocks) for support',
              'Stop if you feel dizzy or uncomfortable'
            ]
          },
          {
            name: 'Swimming',
            duration: '20-30 minutes',
            description: 'Low-impact exercise that supports your growing body.',
            benefits: ['Full body workout', 'Reduces joint stress', 'Cooling effect'],
            precautions: ['Avoid diving', 'Use handrails', 'No jumping in pool', 'Avoid hot tubs/saunas', 'Don\'t swim alone'],
            instructions: [
              'Enter pool slowly using steps or ladder',
              'Start with gentle movements in shallow end',
              'Use floating devices if needed for support',
              'Focus on gentle strokes like backstroke',
              'Exit pool carefully using handrails'
            ]
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
            precautions: ['Wear supportive shoes', 'Avoid uneven terrain', 'Stop if breathless', 'Avoid overheating', 'Stay on safe paths'],
            instructions: [
              'Warm up with 5 minutes of slow walking',
              'Gradually increase pace to brisk but comfortable',
              'Pump your arms while walking',
              'Take breaks every 10-15 minutes if needed',
              'Cool down with 5 minutes of slow walking'
            ]
          },
          {
            name: 'Prenatal Pilates',
            duration: '30-45 minutes',
            description: 'Strengthen core and improve posture.',
            benefits: ['Core strength', 'Better posture', 'Reduces back pain'],
            precautions: ['Modify as belly grows', 'Avoid supine positions', 'Don\'t hold breath', 'Stop if uncomfortable', 'Use props for support'],
            instructions: [
              'Start with gentle warm-up movements',
              'Focus on breathing with each movement',
              'Engage core muscles gently, don\'t strain',
              'Use side-lying positions instead of lying on back',
              'End with relaxation and stretching'
            ]
          },
          {
            name: 'Stationary Cycling',
            duration: '20-30 minutes',
            description: 'Safe cardiovascular exercise with back support.',
            benefits: ['Leg strength', 'Cardiovascular health', 'Low impact'],
            precautions: ['Adjust seat height', 'Moderate intensity', 'Don\'t lean forward too much', 'Stop if dizzy', 'Avoid high resistance'],
            instructions: [
              'Adjust seat so knees are slightly bent at bottom of pedal stroke',
              'Start with 5 minutes warm-up at easy pace',
              'Maintain moderate intensity throughout',
              'Keep upper body relaxed and upright',
              'Cool down with 5 minutes of easy pedaling'
            ]
          },
          {
            name: 'Light Weight Training',
            duration: '20-30 minutes',
            description: 'Maintain muscle strength with lighter weights.',
            benefits: ['Muscle maintenance', 'Bone health', 'Metabolism boost'],
            precautions: ['Avoid heavy lifting', 'Focus on form', 'Don\'t hold breath', 'Stop between sets', 'Avoid overhead lifting'],
            instructions: [
              'Use weights that allow 12-15 repetitions comfortably',
              'Focus on controlled, slow movements',
              'Breathe out during exertion, in during release',
              'Rest 30-60 seconds between sets',
              'Stop if you feel any strain or discomfort'
            ]
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
            precautions: ['Listen to your body', 'Rest when needed', 'Stop if contractions occur', 'Avoid long distances', 'Carry water and phone'],
            instructions: [
              'Walk at a comfortable, leisurely pace',
              'Take frequent breaks to rest',
              'Walk on flat, safe surfaces only',
              'Bring water and a phone',
              'Stop immediately if you feel contractions'
            ]
          },
          {
            name: 'Prenatal Yoga',
            duration: '15-30 minutes',
            description: 'Focus on breathing and gentle stretches.',
            benefits: ['Relaxation', 'Pain relief', 'Labor preparation'],
            precautions: ['Use props for support', 'Avoid deep stretches', 'No inversions', 'Don\'t overstretch', 'Stop if dizzy'],
            instructions: [
              'Use pillows and blocks for extra support',
              'Practice deep breathing exercises',
              'Hold poses for shorter periods',
              'Focus on hip-opening and relaxation poses',
              'End with meditation or relaxation'
            ]
          },
          {
            name: 'Pelvic Floor Exercises',
            duration: '10-15 minutes',
            description: 'Strengthen muscles for delivery and recovery.',
            benefits: ['Labor preparation', 'Faster recovery', 'Prevents incontinence'],
            precautions: ['Learn proper technique', 'Don\'t overdo it', 'Don\'t hold breath', 'Stop if painful', 'Start gradually'],
            instructions: [
              'Sit comfortably or lie on your side',
              'Tighten pelvic floor muscles as if stopping urine flow',
              'Hold for 3-5 seconds, then relax',
              'Repeat 10-15 times, 3 times daily',
              'Breathe normally, don\'t hold your breath'
            ]
          },
          {
            name: 'Swimming (if comfortable)',
            duration: '15-25 minutes',
            description: 'Water supports your weight and reduces pressure.',
            benefits: ['Joint relief', 'Reduces swelling', 'Relaxation'],
            precautions: ['Use pool ladder', 'Avoid hot tubs', 'Don\'t swim alone', 'Avoid deep water', 'Exit if tired'],
            instructions: [
              'Enter and exit pool using ladder or steps',
              'Start with gentle water walking',
              'Use backstroke or sidestroke for swimming',
              'Take breaks floating on your back if comfortable',
              'Stay in water that\'s chest-deep or shallower'
            ]
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
    <>
      <SharedNavigation user={user} />
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
              How to do it:
            </Typography>
            <Box sx={{ mb: 2, pl: 2, borderLeft: '3px solid #ff6b9d' }}>
              {exercise.instructions?.map((instruction, idx) => (
                <Typography key={idx} variant="body2" paragraph className="text-dark">
                  {idx + 1}. {instruction}
                </Typography>
              ))}
            </Box>

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
    </>
  );
};

export default Exercise;