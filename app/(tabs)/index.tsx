import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, Animated } from 'react-native';

const BLOCK_SIZE = Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.5;
const DOT_SIZE = 10;
const ROTATION_SPEED = 0.5; // rotations per second

interface Dot {
  angle: number;
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
      })
    ).start();
  };

  const handleTap = () => {
    if (gameOver) {
      // Reset game
      setDots([]);
      setScore(0);
      setGameOver(false);
      return;
    }

    const newDot = { angle: currentRotation };

    // Check for collisions
    const hasCollision = dots.some(dot => {
      const angleDiff = Math.abs(dot.angle - currentRotation);
      return angleDiff < 20 || (360 - angleDiff) < 20;
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
                    transform: [
                      { rotate: `${dot.angle}deg` },
                      { translateY: -BLOCK_SIZE / 2 + DOT_SIZE },
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
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#ff4757',
  },
  score: {
    position: 'absolute',
    top: 50,
    fontSize: 24,
    color: '#fff',
  },
  gameOver: {
    position: 'absolute',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 48,
    color: '#ff4757',
    fontWeight: 'bold',
  },
  tapToRestart: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
  },
});