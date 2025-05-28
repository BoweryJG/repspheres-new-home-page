import React, { useState } from 'react';
import { Box, Container, Typography, Button, Grid, Paper, Chip } from '@mui/material';
// import { motion } from 'framer-motion'; // Uncomment after installing framer-motion
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import TimelineIcon from '@mui/icons-material/Timeline';

export default function AIVisualizerSection() {
  const [activeDemo, setActiveDemo] = useState('dental');

  const procedures = {
    dental: {
      title: 'Dental Implants',
      subtitle: 'See realistic tooth replacement results',
      gradient: 'linear-gradient(135deg, #00ffc6 0%, #3a86ff 100%)',
      features: ['Natural tooth matching', 'Gum line adjustment', '95% confidence accuracy']
    },
    aesthetic: {
      title: 'Lip Enhancement',
      subtitle: 'Visualize natural volume increase',
      gradient: 'linear-gradient(135deg, #ff006e 0%, #7B42F6 100%)',
      features: ['30% volume increase', 'Border definition', 'Natural asymmetry preserved']
    },
    surgical: {
      title: 'Rhinoplasty',
      subtitle: 'Preview nose refinement with golden ratio',
      gradient: 'linear-gradient(135deg, #7B42F6 0%, #3a86ff 100%)',
      features: ['Bridge straightening', 'Tip refinement', 'Golden ratio analysis']
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(24,24,43,1) 0%, rgba(11,11,32,0.98) 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Animated background effect */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.05,
          background: 'radial-gradient(circle at 20% 50%, #00ffc6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #7B42F6 0%, transparent 50%)',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Box
            sx={{
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'all 0.6s ease',
            }}
          >
            <Chip
              icon={<AutoAwesomeIcon sx={{ color: '#00ffc6 !important' }} />}
              label="AI-POWERED VISUALIZATION"
              sx={{
                mb: 3,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                fontFamily: "'DM Sans', Arial, sans-serif",
                fontWeight: 600,
                background: 'rgba(0,255,198,0.1)',
                border: '1px solid rgba(0,255,198,0.3)',
                color: '#00ffc6',
                '& .MuiChip-icon': {
                  color: '#00ffc6',
                },
              }}
            />
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Space Grotesk', Arial, sans-serif",
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
              mb: 4,
              lineHeight: 1.2,
            }}
          >
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              See the Future
            </Box>
            <br />
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.95)' }}>
              Before the Procedure
            </Box>
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontFamily: "'DM Sans', Arial, sans-serif",
              fontWeight: 500,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 900,
              mx: 'auto',
              mb: 6,
            }}
          >
            Our AI analyzes 468 facial landmarks using MediaPipe technology to create medically accurate visualizations. 
            Show patients realistic outcomes based on golden ratio principles and actual procedure results.
          </Typography>
        </Box>

        {/* Procedure selector */}
        <Box sx={{ mb: 8, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {Object.entries(procedures).map(([key, procedure]) => (
            <Box key={key} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
              <Button
                onClick={() => setActiveDemo(key)}
                sx={{
                  px: 4,
                  py: 2,
                  borderRadius: '30px',
                  background: activeDemo === key ? procedure.gradient : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${activeDemo === key ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                  color: '#fff',
                  fontFamily: "'DM Sans', Arial, sans-serif",
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: activeDemo === key ? procedure.gradient : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {procedure.title}
              </Button>
            </Box>
          ))}
        </Box>

        {/* Demo Area */}
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              key={activeDemo}
              sx={{
                opacity: 1,
                transform: 'translateX(0)',
                transition: 'all 0.6s ease',
              }}
            >
              <Box
                sx={{
                  p: 6,
                  borderRadius: '30px',
                  background: 'rgba(40, 20, 70, 0.55)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Gradient overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: procedures[activeDemo].gradient,
                    opacity: 0.1,
                    filter: 'blur(60px)',
                  }}
                />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "'Space Grotesk', Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: { xs: '1.8rem', md: '2.2rem' },
                      mb: 2,
                      background: procedures[activeDemo].gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {procedures[activeDemo].title}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', Arial, sans-serif",
                      fontSize: '1.1rem',
                      color: 'rgba(255,255,255,0.7)',
                      mb: 4,
                    }}
                  >
                    {procedures[activeDemo].subtitle}
                  </Typography>

                  {/* Feature list */}
                  <Box sx={{ mb: 4 }}>
                    {procedures[activeDemo].features.map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: procedures[activeDemo].gradient,
                            mr: 2,
                            boxShadow: '0 0 10px rgba(0,255,198,0.5)',
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "'DM Sans', Arial, sans-serif",
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '1rem',
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Demo placeholder */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: '20px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center',
                      minHeight: 300,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CameraAltIcon
                      sx={{
                        fontSize: 60,
                        color: 'rgba(255,255,255,0.3)',
                        mb: 2,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', Arial, sans-serif",
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '1rem',
                      }}
                    >
                      Upload patient photo to see AI visualization
                    </Typography>
                  </Paper>

                  <Button
                    fullWidth
                    sx={{
                      mt: 4,
                      py: 2,
                      borderRadius: '15px',
                      background: procedures[activeDemo].gradient,
                      color: '#fff',
                      fontFamily: "'DM Sans', Arial, sans-serif",
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      '&:hover': {
                        background: procedures[activeDemo].gradient,
                        filter: 'brightness(1.1)',
                      },
                    }}
                    onClick={() => window.open('https://aime.netlify.app', '_blank')}
                  >
                    Try Live Demo
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                opacity: 1,
                transform: 'translateX(0)',
                transition: 'all 0.6s ease',
                transitionDelay: '0.2s',
              }}
            >
              <Box sx={{ pl: { md: 4 } }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: "'Space Grotesk', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    mb: 4,
                    color: 'rgba(255,255,255,0.95)',
                  }}
                >
                  Why This Matters
                </Typography>

                {/* Benefits */}
                {[
                  {
                    icon: <FaceRetouchingNaturalIcon />,
                    title: 'Build Patient Trust',
                    description: 'Show realistic outcomes, not Instagram filters. Our AI preserves natural asymmetry for believable results.',
                  },
                  {
                    icon: <TimelineIcon />,
                    title: 'Increase Conversion',
                    description: 'Patients who can visualize results are 3x more likely to proceed with treatment.',
                  },
                  {
                    icon: <AutoAwesomeIcon />,
                    title: 'Golden Ratio Analysis',
                    description: 'Mathematical beauty principles (φ = 1.618) ensure aesthetically pleasing, harmonious outcomes.',
                  },
                ].map((benefit, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      mb: 4,
                      p: 3,
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mr: 3,
                        p: 2,
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, rgba(0,255,198,0.1) 0%, rgba(123,66,246,0.1) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {React.cloneElement(benefit.icon, {
                        sx: { fontSize: 30, color: '#00ffc6' }
                      })}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "'Space Grotesk', Arial, sans-serif",
                          fontWeight: 600,
                          fontSize: '1.2rem',
                          mb: 1,
                          color: 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {benefit.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'DM Sans', Arial, sans-serif",
                          fontSize: '1rem',
                          color: 'rgba(255,255,255,0.6)',
                          lineHeight: 1.6,
                        }}
                      >
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {/* Tech specs */}
                <Box
                  sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(0,255,198,0.05) 0%, rgba(123,66,246,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Space Grotesk', Arial, sans-serif",
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      mb: 2,
                      color: '#00ffc6',
                    }}
                  >
                    Technical Specifications
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Facial Landmarks', value: '468' },
                      { label: 'Confidence Level', value: '80-95%' },
                      { label: 'Processing Time', value: '6 seconds' },
                      { label: 'Procedures', value: '7 types' },
                    ].map((spec, index) => (
                      <Grid item xs={6} key={index}>
                        <Typography
                          sx={{
                            fontFamily: "'DM Sans', Arial, sans-serif",
                            fontSize: '0.9rem',
                            color: 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {spec.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Space Grotesk', Arial, sans-serif",
                            fontWeight: 700,
                            fontSize: '1.3rem',
                            color: 'rgba(255,255,255,0.9)',
                          }}
                        >
                          {spec.value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}