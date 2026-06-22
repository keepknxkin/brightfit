import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '@/constants';

interface Props {
  visible: boolean;
  onSubmit: (name: string) => void;
  onSignIn?: () => void;
}

export default function NamePromptModal({ visible, onSubmit, onSignIn }: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (visible) setName('');
  }, [visible]);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop} />
        <View style={styles.card}>
          <Text style={styles.title}>What should we call you?</Text>
          <Text style={styles.subtitle}>
            We'll use your name to personalize your workouts and progress.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#666677"
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus
            value={name}
            onChangeText={setName}
            onSubmitEditing={() => {
              if (canSubmit) onSubmit(trimmed);
            }}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={() => canSubmit && onSubmit(trimmed)}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>Continue</Text>
          </TouchableOpacity>

          {onSignIn ? (
            <TouchableOpacity onPress={onSignIn} activeOpacity={0.7} style={styles.signInRow}>
              <Text style={styles.signInPrompt}>
                Already have an account?{' '}
                <Text style={styles.signInLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  card: {
    backgroundColor: '#16161D',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#9999AA',
    lineHeight: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2A2A35',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    backgroundColor: '#0B0B0F',
  },
  submitButton: {
    backgroundColor: colors.primaryGold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.matteBlack,
  },
  signInRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  signInPrompt: {
    fontSize: 14,
    color: '#9999AA',
    textAlign: 'center',
  },
  signInLink: {
    fontWeight: '700',
    color: colors.primaryGold,
  },
});
