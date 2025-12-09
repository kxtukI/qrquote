import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';

export default function HomeScreen() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [detectedLink, setDetectedLink] = useState<string | null>(null);
  const [lastSpokenText, setLastSpokenText] = useState("");

  const [speechRate, setSpeechRate] = useState(0.9);

  useEffect(() => {
    async function loadVoices() {
      const availableVoices = await Speech.getAvailableVoicesAsync();
      const portugueseVoices = availableVoices.filter(v => v.language.includes('pt-BR'));
      if (portugueseVoices.length > 0) {
        const voiceToUse = portugueseVoices.length > 1 ? portugueseVoices[1] : portugueseVoices[0];
        setSelectedVoice(voiceToUse.identifier);
      }
    }
    loadVoices();
  }, []);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      if (totalForce > 1.5) {
        cancelSpeechAndReset();
      }
    });
    return () => subscription && subscription.remove();
  }, [scanned]);

  const cancelSpeechAndReset = () => {
    Speech.isSpeakingAsync().then((isSpeaking) => {
      if (isSpeaking || scanned) {
        Speech.stop();
        setDetectedLink(null);
        setScanned(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    });
  };

  const cycleSpeed = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let newRate = 0.9;
    let label = "Velocidade Normal";

    if (speechRate === 0.9) {
      newRate = 1.4;
      label = "Rápida";
    } else if (speechRate === 1.4) {
      newRate = 2.0;
      label = "Muito Rápida";
    } else {
      newRate = 0.9;
      label = "Normal";
    }

    setSpeechRate(newRate);

    Speech.stop();
    Speech.speak(label, {
      language: 'pt-BR',
      voice: selectedVoice || undefined,
      rate: newRate,
    });
  };

  const handleTorchToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTorchEnabled(!torchEnabled);

    if (!torchEnabled) {
      Speech.speak("Lanterna ligada", {
        language: 'pt-BR',
        voice: selectedVoice || undefined,
        rate: speechRate
      });
    }
    else {
      Speech.speak("Lanterna desligada", {
        language: 'pt-BR',
        voice: selectedVoice || undefined,
        rate: speechRate
      });
    }
  };

  if (!permission) return <View style={styles.container}><ActivityIndicator /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message} onPress={requestPermission}>Toque para permitir câmera</Text>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const isUrl = data.toLowerCase().startsWith('http');

    if (isUrl) {
      setDetectedLink(data);
      const cleanText = data.replace(/(^\w+:|^)\/\//, '').replace('www.', '');
      setLastSpokenText(`Link para ${cleanText}`);

      Speech.speak(`Link para ${cleanText}. Toque para abrir ou agite para cancelar.`, {
        language: 'pt-BR',
        voice: selectedVoice || undefined,
        rate: speechRate,
        onDone: () => {
          setTimeout(() => {
            setDetectedLink(null);
            setScanned(false);
          }, 4000);
        }
      });
    } else {
      setDetectedLink(null);
      setLastSpokenText(data);
      Speech.speak(data, {
        language: 'pt-BR',
        voice: selectedVoice || undefined,
        rate: speechRate,
        onDone: () => {
          setTimeout(() => setScanned(false), 1500);
        }
      });
    }
  };

  const handleRepeat = () => {
    if (lastSpokenText) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Speech.stop();
      Speech.speak("Repetindo. " + lastSpokenText, {
        language: 'pt-BR',
        voice: selectedVoice || undefined,
        rate: speechRate,
      });
    } else {
      Speech.speak("Nada para repetir.", {
        language: 'pt-BR',
        voice: selectedVoice || undefined,
        rate: speechRate,
      });
    }
  };

  const handleScreenPress = () => {
    if (scanned && detectedLink) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Linking.openURL(detectedLink);
      setDetectedLink(null);
      setScanned(false);
    } else if (scanned && !detectedLink) {
      cancelSpeechAndReset();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={handleScreenPress}
        onLongPress={handleRepeat}
        delayLongPress={600}
      >
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torchEnabled}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {scanned && (
          <View style={styles.overlay}>
            <Ionicons
              name={detectedLink ? "globe-outline" : "text-outline"}
              size={50}
              color="white"
            />
            <Text style={styles.instructionText}>
              {detectedLink ? "Toque: Abrir\nAgite: Cancelar" : "Lendo...\nAgite para parar"}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={cycleSpeed}
        >
          <Ionicons name="speedometer-outline" size={28} color="white" />
          <Text style={styles.buttonLabel}>
            {speechRate === 0.9 ? "1x" : speechRate === 1.4 ? "1.5x" : "2x"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.circleButton, torchEnabled && styles.torchButtonActive]}
          onPress={handleTorchToggle}
        >
          <Ionicons name={torchEnabled ? "flash" : "flash-off"} size={28} color={torchEnabled ? "black" : "white"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    marginTop: 50
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 24,
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  circleButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white'
  },
  torchButtonActive: {
    backgroundColor: 'white',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: -25
  }
});