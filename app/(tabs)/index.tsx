import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, Animated, Easing } from 'react-native';

const BLOCK_SIZE = Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.5;
const DOT_SIZE = 10;
const ROTATION_SPEED = 0.25; // 4 seconds per rotation
const ARROW_SIZE = 20;
const RADIUS = (BLOCK_SIZE / 2) - (DOT_SIZE * 1.5); // Slightly inside the block's edge

interface Dot {
  angle: number; // The angle at which the dot was placed relative to the block's rotation
}

export default function KnifeFight() {
  const [score, setScore] = useState(0);
  const [dots, setDots] = useState<Dot[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    startRotation();
    // Add listener for rotation updates
    const id = rotationAnim.addListener(({ value }) => {
      setCurrentRotation(value % 360);
    });
    return () => rotationAnim.removeListener(id);
  }, []);

  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 360,
        duration: (1 / ROTATION_SPEED) * 1000,
        useNativeDriver: true,
        easing: Easing.linear
      })
    ).start();
  };

  const handleTap = () => {
    if (gameOver) {
      setDots([]);
      setScore(0);
      setGameOver(false);
      return;
    }

    // The dot should be placed at the opposite of the current rotation
    // This ensures it appears at the 12 o'clock position
    const placementAngle = -currentRotation;
    const newDot = { angle: placementAngle };

    // Check for physical dot overlap using their positions on the circle
    const hasCollision = dots.some(dot => {
      // Calculate the absolute positions of both dots
      const newDotAbsoluteAngle = (placementAngle + currentRotation + 360) % 360;
      const existingDotAbsoluteAngle = (dot.angle + currentRotation + 360) % 360;
      
      // Convert to radians
      const newDotRad = (newDotAbsoluteAngle * Math.PI) / 180;
      const existingDotRad = (existingDotAbsoluteAngle * Math.PI) / 180;

      // Calculate positions on the circle
      const newX = RADIUS * Math.sin(newDotRad);
      const newY = -RADIUS * Math.cos(newDotRad);
      const existingX = RADIUS * Math.sin(existingDotRad);
      const existingY = -RADIUS * Math.cos(existingDotRad);

      // Calculate actual distance between dots
      const distance = Math.sqrt(
        Math.pow(newX - existingX, 2) + 
        Math.pow(newY - existingY, 2)
      );

      return distance < DOT_SIZE;
    });

    if (hasCollision) {
      setGameOver(true);
    } else {
      setDots([...dots, newDot]);
      setScore(score + 10);
    }
  };

  const spin = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.gameArea}>
          {/* Simple white arrow */}
          <View style={styles.targetingArrow}>
            <View style={{
              width: 4,
              height: ARROW_SIZE,
              backgroundColor: '#FFFFFF',
              position: 'absolute',
              top: -ARROW_SIZE - DOT_SIZE,
            }} />
            <View style={{
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: 10,
              borderRightWidth: 10,
              borderBottomWidth: 15,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: '#FFFFFF',
              position: 'absolute',
              top: -ARROW_SIZE - DOT_SIZE - 14,
            }} />
          </View>
          <Animated.View
            style={[
              styles.block,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            {dots.map((dot, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    position: 'absolute',
                    transform: [
                      { translateY: -RADIUS },
                      { rotate: `${dot.angle}deg` },
                    ],
                  },
                ]}
              />
            ))}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      {gameOver && (
        <View style={styles.gameOver}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.tapToRestart}>Tap to restart</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameArea: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: BLOCK_SIZE / 2,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B4A',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#FF1E1E',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  score: {
    position: 'absolute',
    top: 50,
    fontSize: 24,
    color: '#FF6B4A',
    fontWeight: 'bold',
  },
  gameOver: {
    position: 'absolute',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 48,
    color: '#FF1E1E',
    fontWeight: 'bold',
  },
  tapToRestart: {
    fontSize: 18,
    color: '#FF6B4A',
    marginTop: 10,
  },
  shooter: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE * 2,
    backgroundColor: '#fff',
    top: (Dimensions.get('window').height - BLOCK_SIZE) / 2 - DOT_SIZE * 2,
    left: (Dimensions.get('window').width - DOT_SIZE) / 2,
    borderRadius: DOT_SIZE / 2,
  },
  targetingArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ARROW_SIZE,
    height: ARROW_SIZE * 2,
    position: 'absolute',
    top: -ARROW_SIZE * 2,
    left: (BLOCK_SIZE - ARROW_SIZE) / 2,
    zIndex: 10,
  },
  arrowHead: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: ARROW_SIZE / 2,
    borderRightWidth: ARROW_SIZE / 2,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  arrowStem: {
    width: 4,
    height: ARROW_SIZE,
    backgroundColor: '#FFFFFF',
    marginBottom: -1,
  },
});