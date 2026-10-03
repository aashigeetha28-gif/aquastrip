import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { StatusBadge } from '../../src/components/StatusBadge';
import { Colors } from '../../src/constants/theme';
import { parseAndValidateQr, REGISTERED_BATCHES } from '../../src/services/qrValidator';
import { detectPads } from '../../src/services/padDetector';
import { calculateFrc } from '../../src/services/frcCalculator';
import { useTest } from '../../src/context/TestContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScanScreen() {
  const router = useRouter();
  const {
    scannedBatch,
    setScannedBatch,
    capturedPhotoUri,
    setCapturedPhotoUri,
    padDetection,
    setPadDetection,
  } = useTest();

  // Screen State
  const [step, setStep] = useState<'qr' | 'photo' | 'detected'>('qr');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'barcode' | 'photo'>('barcode');
  const [manualBatchInput, setManualBatchInput] = useState('');
  const [qrError, setQrError] = useState<string | null>(null);
  const [isProcessingDetection, setIsProcessingDetection] = useState(false);

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Synchronize internal step with context
  useEffect(() => {
    if (padDetection) {
      setStep('detected');
    } else if (scannedBatch && scannedBatch.is_valid) {
      setStep('photo');
    } else {
      setStep('qr');
    }
  }, [scannedBatch, padDetection]);

  // Handler for Barcode Scanned
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setCameraActive(false);
    validateBatchString(data);
  };

  const validateBatchString = (code: string) => {
    setQrError(null);
    const result = parseAndValidateQr(code);

    if (!result.isValid) {
      setQrError(result.errorMessage || 'Invalid test strip QR code.');
      if (result.isExpired) {
        setScannedBatch(result.batch);
      }
      return;
    }

    setScannedBatch(result.batch);
    setStep('photo');
  };

  // Simulate scanning a batch (Quick Buttons for easy testing)
  const handleQuickBatchSelect = (batchId: string) => {
    validateBatchString(`BATCH:${batchId}`);
  };

  // Trigger pad detection on a chosen photo/preset
  const handleProcessStripPhoto = async (presetCount?: number, photoUri?: string) => {
    setIsProcessingDetection(true);
    setCameraActive(false);
    try {
      if (photoUri) {
        setCapturedPhotoUri(photoUri);
      } else {
        // Mock URI for visual display
        setCapturedPhotoUri('simulated://strip_photo.jpg');
      }

      // Run pad detection MVP (HSV thresholds + reference patch normalization)
      const detectionResult = await detectPads({
        imageUri: photoUri,
        presetCount: typeof presetCount === 'number' ? presetCount : 2,
      });

      setPadDetection(detectionResult);
      setStep('detected');
    } catch (error) {
      Alert.alert('Detection Error', 'Failed to analyze strip photo. Please try again.');
    } finally {
      setIsProcessingDetection(false);
    }
  };

  const handleStartRealCamera = async (mode: 'barcode' | 'photo') => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is needed to scan strip QR codes and capture pad photos.'
        );
        return;
      }
    }
    setCameraMode(mode);
    setCameraActive(true);
  };

  const handleReset = () => {
    setScannedBatch(null);
    setCapturedPhotoUri(null);
    setPadDetection(null);
    setQrError(null);
    setStep('qr');
  };

  const currentFrc = padDetection ? calculateFrc(padDetection.bluePadCount) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header title="Scan Cl-Ladder" subtitle="Strip Validation & Pad Detection" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Progress Stepper */}
        <View style={styles.stepperContainer}>
          <View style={[styles.stepItem, step === 'qr' && styles.stepItemActive]}>
            <View style={[styles.stepCircle, step !== 'qr' && styles.stepCircleCompleted]}>
              {step !== 'qr' && scannedBatch?.is_valid ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <Text style={styles.stepCircleText}>1</Text>
              )}
            </View>
            <Text style={styles.stepLabel}>Scan QR</Text>
          </View>

          <View style={styles.stepDivider} />

          <View style={[styles.stepItem, step === 'photo' && styles.stepItemActive]}>
            <View
              style={[
                styles.stepCircle,
                step === 'detected' && styles.stepCircleCompleted,
                step === 'photo' && styles.stepCircleActive,
              ]}
            >
              {step === 'detected' ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <Text style={styles.stepCircleText}>2</Text>
              )}
            </View>
            <Text style={styles.stepLabel}>Strip Photo</Text>
          </View>

          <View style={styles.stepDivider} />

          <View style={[styles.stepItem, step === 'detected' && styles.stepItemActive]}>
            <View style={[styles.stepCircle, step === 'detected' && styles.stepCircleActive]}>
              <Text style={styles.stepCircleText}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Result</Text>
          </View>
        </View>

        {/* Real Camera View Overlay */}
        {cameraActive && (
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraContainer}>
              <CameraView
                style={StyleSheet.absoluteFill}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr', 'code128', 'code39'],
                }}
                onBarcodeScanned={cameraMode === 'barcode' ? handleBarcodeScanned : undefined}
              />
              {/* Reticle Guide */}
              <View style={styles.cameraReticle}>
                <View style={styles.reticleCornerTL} />
                <View style={styles.reticleCornerTR} />
                <View style={styles.reticleCornerBL} />
                <View style={styles.reticleCornerBR} />
                <Text style={styles.cameraGuideText}>
                  {cameraMode === 'barcode'
                    ? 'Align QR code inside box'
                    : 'Align 6-pad strip inside guidelines'}
                </Text>
              </View>

              {cameraMode === 'photo' && (
                <View style={styles.photoCaptureControls}>
                  <TouchableOpacity
                    style={styles.snapButton}
                    onPress={() => handleProcessStripPhoto(2)}
                  >
                    <View style={styles.snapInner} />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.closeCameraBtn}
                onPress={() => setCameraActive(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 1: SCAN QR & VALIDATE BATCH */}
        {step === 'qr' && (
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Ionicons name="qr-code" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Step 1: Scan Strip QR Code</Text>
                <Text style={styles.stepDesc}>
                  The back of the strip has a QR code containing the batch ID, expiry, and
                  calibration references.
                </Text>
              </View>
            </View>

            {/* Error / Blocked Expiry Banner */}
            {qrError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={24} color={Colors.low} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorTitle}>Validation Warning</Text>
                  <Text style={styles.errorText}>{qrError}</Text>
                </View>
              </View>
            )}

            {/* Live Camera Scanner Button */}
            <Button
              title="Open Camera QR Scanner"
              subtitle="Scan physical strip back"
              icon="camera"
              onPress={() => handleStartRealCamera('barcode')}
              style={{ marginTop: 12 }}
            />

            {/* Manual input / Quick Testing Presets */}
            <View style={styles.quickTestSection}>
              <Text style={styles.quickTestHeader}>⚡ Quick Testing & Simulators</Text>
              <Text style={styles.quickTestSub}>
                Test with certified JJM batches or expired strip blocking:
              </Text>

              <View style={styles.presetButtonsRow}>
                <TouchableOpacity
                  style={[styles.presetButton, styles.presetValid]}
                  onPress={() => handleQuickBatchSelect('JJM-2026-B4')}
                >
                  <Ionicons name="checkmark-circle" size={16} color={Colors.safe} />
                  <View>
                    <Text style={styles.presetTitle}>Valid Batch (2026)</Text>
                    <Text style={styles.presetSub}>JJM-2026-B4 • Exp 31 Dec 2026</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetButton, styles.presetExpired]}
                  onPress={() => handleQuickBatchSelect('JJM-2025-A1')}
                >
                  <Ionicons name="close-circle" size={16} color={Colors.low} />
                  <View>
                    <Text style={styles.presetTitle}>Expired Batch (Blocked)</Text>
                    <Text style={styles.presetSub}>JJM-2025-A1 • Exp Jun 2025</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Manual Batch Text Input */}
              <View style={styles.manualInputRow}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Enter Batch ID (e.g. JJM-2026-B8)"
                  value={manualBatchInput}
                  onChangeText={setManualBatchInput}
                  autoCapitalize="characters"
                />
                <Button
                  title="Verify"
                  size="small"
                  onPress={() => validateBatchString(manualBatchInput)}
                  style={{ minWidth: 80 }}
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 2: CAPTURE STRIP PHOTO */}
        {step === 'photo' && scannedBatch && (
          <View style={styles.stepCard}>
            {/* Batch Validated Confirmation Card */}
            <View style={styles.batchInfoCard}>
              <View style={styles.batchInfoRow}>
                <View style={styles.batchValidPill}>
                  <Ionicons name="shield-checkmark" size={16} color={Colors.safe} />
                  <Text style={styles.batchValidText}>Batch Validated</Text>
                </View>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.changeBatchText}>Change</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.batchIdText}>Batch: {scannedBatch.batch_id}</Text>
              <Text style={styles.batchMetaText}>
                Expires: {scannedBatch.expiry} • Supplier: {scannedBatch.manufacturer}
              </Text>
            </View>

            {/* Strip Capture Instructions */}
            <View style={styles.stepHeader}>
              <View style={[styles.stepBadge, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="camera" size={20} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Step 2: Capture Reagent Strip Photo</Text>
                <Text style={styles.stepDesc}>
                  Dip strip for 2 seconds, wait 20 seconds for TMB blue ladder reaction, then snap
                  a photo on a flat white surface.
                </Text>
              </View>
            </View>

            {/* Framing Guide graphic */}
            <View style={styles.framingMock}>
              <View style={styles.stripGraphic}>
                <Text style={styles.stripRefTop}>[ WHITE REF ]</Text>
                <View style={styles.graphicPads}>
                  <View style={[styles.graphicPad, { backgroundColor: Colors.padActive }]} />
                  <View style={[styles.graphicPad, { backgroundColor: Colors.padActive }]} />
                  <View style={[styles.graphicPad, { backgroundColor: Colors.padInactive }]} />
                  <View style={[styles.graphicPad, { backgroundColor: Colors.padInactive }]} />
                  <View style={[styles.graphicPad, { backgroundColor: Colors.padInactive }]} />
                  <View style={[styles.graphicPad, { backgroundColor: Colors.padInactive }]} />
                </View>
                <Text style={styles.stripRefBottom}>[ BLUE REF ]</Text>
              </View>
              <Text style={styles.framingHint}>
                Align the 6 pads and top/bottom reference patches inside the camera frame
              </Text>
            </View>

            {/* Camera Button */}
            <Button
              title="Open Camera for Strip"
              icon="camera"
              onPress={() => handleStartRealCamera('photo')}
              style={{ marginTop: 10 }}
            />

            {/* Test strip scenario simulators (Crucial for testing all FRC ladder rungs!) */}
            <View style={styles.quickTestSection}>
              <Text style={styles.quickTestHeader}>🧪 Test Sample Strip Presets</Text>
              <Text style={styles.quickTestSub}>
                Simulate different tap water residual chlorine levels:
              </Text>

              <View style={styles.sampleGrid}>
                <TouchableOpacity
                  style={[styles.sampleBtn, styles.sampleLow]}
                  onPress={() => handleProcessStripPhoto(0)}
                >
                  <Text style={styles.sampleBtnTitle}>0 Pads Blue</Text>
                  <Text style={styles.sampleBtnSub}>&lt;0.1 ppm (Low Alert)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sampleBtn, styles.sampleLow]}
                  onPress={() => handleProcessStripPhoto(1)}
                >
                  <Text style={styles.sampleBtnTitle}>1 Pad Blue</Text>
                  <Text style={styles.sampleBtnSub}>0.1 ppm (Low Alert)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sampleBtn, styles.sampleSafe]}
                  onPress={() => handleProcessStripPhoto(2)}
                >
                  <Text style={styles.sampleBtnTitle}>2 Pads Blue</Text>
                  <Text style={styles.sampleBtnSub}>0.2 ppm (Safe Min)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sampleBtn, styles.sampleSafe]}
                  onPress={() => handleProcessStripPhoto(3)}
                >
                  <Text style={styles.sampleBtnTitle}>3 Pads Blue</Text>
                  <Text style={styles.sampleBtnSub}>0.5 ppm (Safe Opt)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sampleBtn, styles.sampleSafe]}
                  onPress={() => handleProcessStripPhoto(4)}
                >
                  <Text style={styles.sampleBtnTitle}>4 Pads Blue</Text>
                  <Text style={styles.sampleBtnSub}>1.0 ppm (Safe Max)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sampleBtn, styles.sampleHigh]}
                  onPress={() => handleProcessStripPhoto(5)}
                >
                  <Text style={styles.sampleBtnTitle}>5 Pads Blue</Text>
                  <Text style={styles.sampleBtnSub}>2.0 ppm (High)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {isProcessingDetection && (
              <View style={styles.processingCover}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.processingText}>
                  Normalizing HSV colors & classifying 6 pads...
                </Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 3: DETECTION COMPLETE PREVIEW */}
        {step === 'detected' && padDetection && currentFrc && (
          <View style={styles.stepCard}>
            <View style={styles.detectedHeader}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.safe} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detectedTitle}>Pad Detection Complete</Text>
                <Text style={styles.detectedSub}>
                  Algorithm: {padDetection.algorithm} • Confidence:{' '}
                  {Math.round(padDetection.normalizedConfidence * 100)}%
                </Text>
              </View>
            </View>

            {/* Quick Result Summary Card */}
            <View style={styles.detectionSummaryBox}>
              <View style={styles.summaryTop}>
                <StatusBadge status={currentFrc.status} size="large" />
                <Text style={styles.summaryCount}>
                  {padDetection.bluePadCount} / 6 pads blue
                </Text>
              </View>

              <Text style={styles.summaryFrcValue}>{currentFrc.frcRange}</Text>
              <Text style={styles.summaryActionText}>{currentFrc.actionDescription}</Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actionColumn}>
              <Button
                title="View Full Result & Report"
                subtitle="Save test with GPS location & worker details"
                icon="checkmark-done"
                onPress={() => router.push('/result')}
                size="large"
              />

              <Button
                title="Manual Pad Override (Verify / Tap)"
                subtitle="Tap pads if lighting caused misclassification"
                variant="outline"
                icon="hand-left"
                onPress={() => router.push('/override')}
                size="normal"
                style={{ marginTop: 10 }}
              />

              <Button
                title="Discard & Re-scan"
                variant="secondary"
                icon="refresh"
                onPress={handleReset}
                size="small"
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.6,
  },
  stepItemActive: {
    opacity: 1,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.safe,
    borderColor: Colors.safe,
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepDivider: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  stepBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.lowLight,
    borderWidth: 1.5,
    borderColor: Colors.lowBorder,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.low,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 17,
  },
  quickTestSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickTestHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quickTestSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  presetButtonsRow: {
    flexDirection: 'column',
    gap: 8,
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  presetValid: {
    backgroundColor: Colors.safeLight,
    borderColor: Colors.safeBorder,
  },
  presetExpired: {
    backgroundColor: Colors.lowLight,
    borderColor: Colors.lowBorder,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  presetSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  manualInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  batchInfoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  batchInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  batchValidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batchValidText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.safe,
  },
  changeBatchText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  batchIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  batchMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  framingMock: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  stripGraphic: {
    width: 220,
    backgroundColor: '#FEF9C3',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  stripRefTop: {
    fontSize: 10,
    fontWeight: '700',
    color: '#854D0E',
    marginBottom: 6,
  },
  graphicPads: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  graphicPad: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  stripRefBottom: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 6,
  },
  framingHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  sampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleBtn: {
    width: '48%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  sampleLow: {
    backgroundColor: Colors.lowLight,
    borderColor: Colors.lowBorder,
  },
  sampleSafe: {
    backgroundColor: Colors.safeLight,
    borderColor: Colors.safeBorder,
  },
  sampleHigh: {
    backgroundColor: Colors.highLight,
    borderColor: Colors.highBorder,
  },
  sampleBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sampleBtnSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  processingCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    padding: 20,
  },
  processingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginTop: 12,
    textAlign: 'center',
  },
  detectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  detectedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  detectedSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detectionSummaryBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  summaryFrcValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  summaryActionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionColumn: {
    marginTop: 8,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraReticle: {
    width: 260,
    height: 260,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0D9488',
  },
  reticleCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0D9488',
  },
  reticleCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0D9488',
  },
  reticleCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0D9488',
  },
  cameraGuideText: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  photoCaptureControls: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  snapButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  closeCameraBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
