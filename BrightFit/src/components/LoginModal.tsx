import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { colors } from '@/constants';
import { useAuth, type AuthSession } from '@/context/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (session: AuthSession) => void;
  title?: string;
  subtitle?: string;
  allowDismiss?: boolean;
}

export default function LoginModal({
  visible,
  onClose,
  onSuccess,
  title = 'Save your progress',
  subtitle = 'Sign in to keep your workouts, streaks, and achievements synced across devices.',
  allowDismiss = true,
}: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setError('');
    setPassword('');
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const session = mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password);
      resetForm();
      onSuccess?.(session);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setError('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={allowDismiss ? onClose : undefined}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={allowDismiss ? onClose : undefined} />
        <View style={styles.card}>
          {allowDismiss && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={12}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
              onPress={() => switchMode('login')}
            >
              <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'signup' && styles.modeTabActive]}
              onPress={() => switchMode('signup')}
            >
              <Text style={[styles.modeTabText, mode === 'signup' && styles.modeTabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.charcoalGray}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.charcoalGray}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.matteBlack} />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'login' ? 'Log In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {mode === 'signup' ? (
            <Text style={styles.hint}>Password must be at least 6 characters.</Text>
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  card: {
    backgroundColor: colors.cardWhite,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1,
  },
  closeText: {
    fontSize: 18,
    color: colors.charcoalGray,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.matteBlack,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.charcoalGray,
    lineHeight: 20,
    marginBottom: 20,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: colors.softWhite,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: colors.cardWhite,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoalGray,
  },
  modeTabTextActive: {
    color: colors.matteBlack,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.matteBlack,
    marginBottom: 12,
    backgroundColor: colors.softWhite,
  },
  error: {
    color: '#C53452',
    fontSize: 13,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.primaryGold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.matteBlack,
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: colors.charcoalGray,
    textAlign: 'center',
  },
});
