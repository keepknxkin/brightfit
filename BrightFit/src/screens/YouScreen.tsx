import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  Modal,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import {
  useWorkout,
  ProgressPhoto,
  getCurrentMeasurements,
} from '../context/WorkoutContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PHOTO_COL_GAP = 10;
const PHOTO_COLS = 2;
const PHOTO_W = (SCREEN_W - 40 - PHOTO_COL_GAP) / PHOTO_COLS;
const PHOTO_H = PHOTO_W * (4 / 3);

const C = {
  bg: '#0B0B0F',
  surface: '#141418',
  border: '#252530',
  gold: '#FFB800',
  goldDim: 'rgba(255,184,0,0.10)',
  goldDimMid: 'rgba(255,184,0,0.22)',
  white: '#FFFFFF',
  muted: '#9999AA',
  dimmed: '#555568',
  green: '#4CAF7D',
};

// ── Camera SVG icon ───────────────────────────────────────────
function CameraIcon({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.5 4L6.5 6H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-2.5L15.5 4h-7z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth="1.8" />
      <Circle cx="18.5" cy="9.5" r="1" fill={color} />
    </Svg>
  );
}

// ── Plus icon ─────────────────────────────────────────────────
function PlusIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Share icon ────────────────────────────────────────────────
function ShareIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v10M12 3l4 4M12 3L8 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

async function shareProgressPhoto(photo: ProgressPhoto) {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }
    const dateStr = new Date(photo.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const label = photo.isDay1 ? 'Day 1 baseline' : 'Progress';
    await Sharing.shareAsync(photo.uri, {
      dialogTitle: `Share ${label} — ${dateStr}`,
      mimeType: 'image/jpeg',
      UTI: 'public.jpeg',
    });
  } catch {
    // User dismissed the share sheet or sharing failed.
  }
}

function PhotoShareButton({
  onPress,
  style,
  size = 16,
}: {
  onPress: () => void;
  style?: ViewStyle;
  size?: number;
}) {
  return (
    <TouchableOpacity
      style={[styles.shareBtn, style]}
      activeOpacity={0.75}
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <ShareIcon color={C.white} size={size} />
    </TouchableOpacity>
  );
}

// ── Full-screen photo viewer ──────────────────────────────────
function PhotoViewer({ photo, onClose }: { photo: ProgressPhoto; onClose: () => void }) {
  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View style={viewerStyles.container}>
        <StatusBar hidden />
        <Image source={{ uri: photo.uri }} style={viewerStyles.image} resizeMode="contain" />
        <View style={viewerStyles.bar}>
          {photo.isDay1 && <View style={viewerStyles.day1Badge}><Text style={viewerStyles.day1Text}>DAY 1</Text></View>}
          <Text style={viewerStyles.dateText}>
            {new Date(photo.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
          <PhotoShareButton onPress={() => shareProgressPhoto(photo)} style={viewerStyles.shareBtn} size={18} />
          <TouchableOpacity style={viewerStyles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={viewerStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const viewerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1, width: '100%' },
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  day1Badge: {
    backgroundColor: C.gold, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  day1Text: { fontSize: 10, fontWeight: '900', color: '#0B0B0F', letterSpacing: 1.2 },
  dateText: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 13 },
  shareBtn: { width: 34, height: 34, borderRadius: 17 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

// ── Props ─────────────────────────────────────────────────────
interface YouScreenProps {
  name: string;
  workoutsPerWeek: string;
  fitnessLevel: string;
  fitnessFocus: string;
}

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────
export default function YouScreen({ name }: YouScreenProps) {
  const { progressPhotos, addProgressPhoto, measurementLogs } = useWorkout();
  const [viewing, setViewing] = useState<ProgressPhoto | null>(null);

  const currentM = getCurrentMeasurements(measurementLogs);
  const day1Photo = progressPhotos.find(p => p.isDay1) ?? null;
  const latestPhoto = progressPhotos.filter(p => !p.isDay1).slice(-1)[0] ?? null;
  const allPhotos = [...progressPhotos].reverse(); // newest first
  const hasComparison = day1Photo !== null && latestPhoto !== null;

  async function pickPhoto(isDay1 = false) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to add progress photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      addProgressPhoto(result.assets[0].uri, isDay1);
    }
  }

  async function takePhoto(isDay1 = false) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take progress photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      addProgressPhoto(result.assets[0].uri, isDay1);
    }
  }

  function promptAddPhoto(isDay1 = false) {
    Alert.alert(
      isDay1 ? 'Set Your Day 1 Photo' : 'Add Progress Photo',
      isDay1
        ? 'This becomes your baseline. You can always update it.'
        : 'Document your progress today.',
      [
        { text: 'Take Photo', onPress: () => takePhoto(isDay1) },
        { text: 'Choose from Library', onPress: () => pickPhoto(isDay1) },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }

  const displayName = name.trim() || 'Athlete';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {viewing && <PhotoViewer photo={viewing} onClose={() => setViewing(null)} />}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ───────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Your Journey</Text>
            <Text style={styles.headerSub}>{displayName}'s progress</Text>
          </View>
          <TouchableOpacity
            style={styles.addPhotoBtn}
            activeOpacity={0.8}
            onPress={() => promptAddPhoto(false)}
          >
            <PlusIcon color={C.gold} size={16} />
            <Text style={styles.addPhotoBtnText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

        {/* ── Day 1 baseline card ───────────────────── */}
        {!day1Photo ? (
          <TouchableOpacity
            style={styles.day1Empty}
            activeOpacity={0.85}
            onPress={() => promptAddPhoto(true)}
          >
            <View style={styles.day1EmptyGlow} />
            <CameraIcon color={C.gold} size={44} />
            <Text style={styles.day1EmptyTitle}>Add your Day 1 photo</Text>
            <Text style={styles.day1EmptyBody}>
              Set your baseline. This photo stays pinned as your starting point so you can see how far you've come.
            </Text>
            <View style={styles.day1EmptyBtn}>
              <Text style={styles.day1EmptyBtnText}>Set Baseline Photo</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.day1PhotoCard}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => setViewing(day1Photo)} style={styles.day1PhotoTap}>
              <Image source={{ uri: day1Photo.uri }} style={styles.day1Image} resizeMode="cover" />
            </TouchableOpacity>
            <PhotoShareButton
              onPress={() => shareProgressPhoto(day1Photo)}
              style={styles.day1ShareBtn}
            />
            <View style={styles.day1Overlay}>
              <View style={styles.day1Badge}>
                <Text style={styles.day1BadgeText}>DAY 1</Text>
              </View>
              <Text style={styles.day1DateText}>
                {new Date(day1Photo.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                style={styles.day1ChangeBtn}
                activeOpacity={0.8}
                onPress={() => promptAddPhoto(true)}
              >
                <Text style={styles.day1ChangeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Before / Now comparison ───────────────── */}
        {hasComparison && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Before → Now</Text>
            <View style={styles.compareRow}>
              <View style={styles.compareCard}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setViewing(day1Photo!)} style={styles.compareTap}>
                  <Image source={{ uri: day1Photo!.uri }} style={styles.compareImage} resizeMode="cover" />
                </TouchableOpacity>
                <PhotoShareButton
                  onPress={() => shareProgressPhoto(day1Photo!)}
                  style={styles.compareShareBtn}
                />
                <View style={styles.compareLabel}>
                  <Text style={styles.compareLabelText}>DAY 1</Text>
                </View>
              </View>
              <View style={styles.compareCard}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setViewing(latestPhoto!)} style={styles.compareTap}>
                  <Image source={{ uri: latestPhoto!.uri }} style={styles.compareImage} resizeMode="cover" />
                </TouchableOpacity>
                <PhotoShareButton
                  onPress={() => shareProgressPhoto(latestPhoto!)}
                  style={styles.compareShareBtn}
                />
                <View style={[styles.compareLabel, { backgroundColor: C.green }]}>
                  <Text style={styles.compareLabelText}>NOW</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Progress photo grid ───────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Progress Photos</Text>
            {allPhotos.length > 0 && (
              <Text style={styles.photoCount}>{allPhotos.length}</Text>
            )}
          </View>

          {allPhotos.length === 0 ? (
            <View style={styles.emptyPhotos}>
              <Text style={styles.emptyPhotosText}>
                Start adding weekly photos to track your transformation.
              </Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {allPhotos.map((photo) => (
                <View key={photo.id} style={styles.photoThumbWrap}>
                  <View style={styles.photoThumbContainer}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setViewing(photo)}
                      style={styles.photoThumbTap}
                    >
                      <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />
                      {photo.isDay1 && (
                        <View style={styles.thumbBadge}>
                          <Text style={styles.thumbBadgeText}>D1</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <PhotoShareButton
                      onPress={() => shareProgressPhoto(photo)}
                      style={styles.photoShareBtn}
                    />
                  </View>
                  <Text style={styles.thumbDate} numberOfLines={1}>
                    {new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              ))}

              {/* Add more photos tile */}
              <TouchableOpacity
                style={styles.photoAddTile}
                activeOpacity={0.8}
                onPress={() => promptAddPhoto(false)}
              >
                <PlusIcon color={C.dimmed} size={28} />
                <Text style={styles.photoAddText}>Add photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Body stats strip ─────────────────────── */}
        {(currentM.weight || currentM.height) && (
          <View style={styles.statsStrip}>
            {currentM.weight ? (
              <View style={styles.statChip}>
                <Text style={styles.statChipLabel}>Weight</Text>
                <Text style={styles.statChipValue}>{currentM.weight} kg</Text>
              </View>
            ) : null}
            {currentM.height ? (
              <View style={styles.statChip}>
                <Text style={styles.statChipLabel}>Height</Text>
                <Text style={styles.statChipValue}>{currentM.height} cm</Text>
              </View>
            ) : null}
            {currentM.chest ? (
              <View style={styles.statChip}>
                <Text style={styles.statChipLabel}>Chest</Text>
                <Text style={styles.statChipValue}>{currentM.chest} cm</Text>
              </View>
            ) : null}
            {currentM.waist ? (
              <View style={styles.statChip}>
                <Text style={styles.statChipLabel}>Waist</Text>
                <Text style={styles.statChipValue}>{currentM.waist} cm</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  // ── Header ──────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: C.white, letterSpacing: -0.4 },
  headerSub: { fontSize: 13, fontWeight: '500', color: C.muted, marginTop: 2 },
  addPhotoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.goldDim,
    borderWidth: 1, borderColor: C.goldDimMid,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  addPhotoBtnText: { fontSize: 13, fontWeight: '700', color: C.gold },

  // ── Day 1 empty state ────────────────────────
  day1Empty: {
    borderWidth: 1.5,
    borderColor: C.goldDimMid,
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: C.goldDim,
    alignItems: 'center',
    padding: 32,
    gap: 10,
    marginBottom: 24,
    overflow: 'hidden',
  },
  day1EmptyGlow: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: C.gold, opacity: 0.05,
    top: -60, right: -40,
  },
  day1EmptyTitle: { fontSize: 18, fontWeight: '800', color: C.white, letterSpacing: -0.2 },
  day1EmptyBody: {
    fontSize: 13, fontWeight: '400', color: C.muted,
    textAlign: 'center', lineHeight: 19,
  },
  day1EmptyBtn: {
    marginTop: 6,
    backgroundColor: C.gold, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 11,
  },
  day1EmptyBtnText: { fontSize: 14, fontWeight: '800', color: '#0B0B0F' },

  // ── Day 1 photo (set) ────────────────────────
  day1PhotoCard: {
    borderRadius: 20, overflow: 'hidden',
    height: SCREEN_W * 0.7,
    marginBottom: 24,
    borderWidth: 1, borderColor: C.border,
    position: 'relative',
  },
  day1PhotoTap: { width: '100%', height: '100%' },
  day1Image: { width: '100%', height: '100%' },
  day1ShareBtn: { position: 'absolute', top: 12, right: 12 },
  day1Overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  day1Badge: {
    backgroundColor: C.gold, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  day1BadgeText: { fontSize: 10, fontWeight: '900', color: '#0B0B0F', letterSpacing: 1.5 },
  day1DateText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#fff' },
  day1ChangeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  day1ChangeBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // ── Before → Now comparison ──────────────────
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.white, letterSpacing: -0.2, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  photoCount: {
    fontSize: 12, fontWeight: '700', color: C.muted,
    backgroundColor: '#1C1C22', borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, overflow: 'hidden',
  },
  compareRow: { flexDirection: 'row', gap: 10 },
  compareCard: {
    flex: 1, borderRadius: 16, overflow: 'hidden',
    height: (SCREEN_W - 40 - 10) / 2 * (4 / 3),
    borderWidth: 1, borderColor: C.border,
    position: 'relative',
  },
  compareTap: { width: '100%', height: '100%' },
  compareImage: { width: '100%', height: '100%' },
  compareShareBtn: { position: 'absolute', top: 8, right: 8 },
  compareLabel: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: C.gold, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  compareLabelText: { fontSize: 10, fontWeight: '900', color: '#0B0B0F', letterSpacing: 1.2 },

  // ── Photo grid ───────────────────────────────
  emptyPhotos: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 24, alignItems: 'center',
  },
  emptyPhotosText: { fontSize: 13, fontWeight: '500', color: C.muted, textAlign: 'center', lineHeight: 19 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: PHOTO_COL_GAP },
  photoThumbWrap: { width: PHOTO_W },
  photoThumbContainer: {
    position: 'relative',
    width: PHOTO_W,
    height: PHOTO_H,
  },
  photoThumbTap: { width: '100%', height: '100%' },
  photoThumb: {
    width: PHOTO_W, height: PHOTO_H,
    borderRadius: 14, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
  },
  photoShareBtn: { position: 'absolute', top: 8, right: 8 },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  thumbBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: C.gold, borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  thumbBadgeText: { fontSize: 9, fontWeight: '900', color: '#0B0B0F', letterSpacing: 1 },
  thumbDate: {
    marginTop: 6, fontSize: 11, fontWeight: '600', color: C.muted, textAlign: 'center',
  },
  photoAddTile: {
    width: PHOTO_W, height: PHOTO_H,
    borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    gap: 6,
  },
  photoAddText: { fontSize: 11, fontWeight: '600', color: C.dimmed },

  // ── Body stats strip ─────────────────────────
  statsStrip: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4,
  },
  statChip: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  statChipLabel: { fontSize: 10, fontWeight: '600', color: C.muted, marginBottom: 3 },
  statChipValue: { fontSize: 16, fontWeight: '800', color: C.white },
});
