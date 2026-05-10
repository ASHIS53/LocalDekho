import React, { useState, useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  useWindowDimensions,
  TouchableOpacity
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  FadeIn
} from 'react-native-reanimated';
import { Phone, ShoppingBag, Globe } from 'lucide-react-native';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth, firebaseConfig } from '../../services/firebase';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { theme } from '../../theme';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import AnimatedBackground from '../../components/AnimatedBackground';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [role, setRole] = useState('customer');
  const [errors, setErrors] = useState({});
  const recaptchaVerifier = useRef(null);
  
  const shakeX = useSharedValue(0);
  const { login } = useContext(AuthContext);

  const shake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const sendOTP = async () => {
    if (phoneNumber.length !== 10) {
      shake();
      setErrors({ phoneNumber: 'Invalid Number' });
      return;
    }
    setLoading(true);
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      // Ensure recaptchaVerifier is available
      if (!recaptchaVerifier.current) {
        throw new Error('Recaptcha verifier not initialized');
      }
      const id = await phoneProvider.verifyPhoneNumber(
        `+91${phoneNumber}`, 
        recaptchaVerifier.current
      );
      setVerificationId(id);
    } catch (err) {
      shake();
      console.error('OTP Send Error:', err);
      // Better error messaging for user
      if (err.code === 'auth/argument-error') {
        setErrors({ phoneNumber: 'System Error: Invalid Configuration' });
      } else {
        setErrors({ phoneNumber: 'Failed to send OTP' });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (verificationCode.length !== 6) {
      shake();
      return;
    }
    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const userCredential = await signInWithCredential(auth, credential);
      const idToken = await userCredential.user.getIdToken();

      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/verify-otp`, {
        idToken,
        role: role
      });

      setSuccess(true);
      setTimeout(() => {
        login(response.data.token, response.data.user);
      }, 1000);
    } catch (err) {
      shake();
      console.error('Verification Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const isDesktop = width >= 1024;

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.logoSection}>
            <Animated.View entering={FadeIn.delay(200).springify()}>
              <View style={styles.logoBadge}>
                <ShoppingBag color={theme.colors.text} size={40} />
              </View>
            </Animated.View>
            <Text style={styles.brandName}>LocalDekho</Text>
            <Text style={styles.tagline}>Hyperlocal Commerce Architecture</Text>
          </View>

          <Animated.View style={[styles.cardWrapper, animatedShakeStyle]}>
            <GlassCard style={styles.loginCard} glow={true}>
              <Text style={styles.cardTitle}>{verificationId ? 'Security Check' : 'Authorization'}</Text>
              <Text style={styles.cardSubtitle}>
                {verificationId ? 'Enter the 6-digit identity token' : 'Select your access portal to continue'}
              </Text>

              {!verificationId && (
                <View style={styles.rolePicker}>
                  {['customer', 'owner', 'admin'].map((r) => (
                    <TouchableOpacity 
                      key={r}
                      onPress={() => setRole(r)}
                      style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                    >
                      <Text style={[styles.roleBtnText, role === r && styles.roleBtnActiveText]}>
                        {r.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.inputContainer}>
                {!verificationId ? (
                  <View>
                    <View style={[styles.inputWrapper, errors.phoneNumber && { borderColor: theme.colors.error }]}>
                      <Phone size={20} color={theme.colors.textSecondary} />
                      <Text style={styles.prefix}>+91</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="99999 99999"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={phoneNumber}
                        onChangeText={(text) => {
                          setPhoneNumber(text);
                          setErrors({});
                        }}
                      />
                    </View>
                    {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                  </View>
                ) : (
                  <View style={styles.otpWrapper}>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="0 0 0 0 0 0"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                      letterSpacing={15}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                    />
                  </View>
                )}
              </View>

              <GradientButton
                title={verificationId ? "AUTHORIZE ACCESS" : "GENERATE OTP"}
                loading={loading}
                success={success}
                onPress={verificationId ? verifyOTP : sendOTP}
                style={styles.actionBtn}
              />

              {verificationId && (
                <TouchableOpacity onPress={() => setVerificationId(null)} style={styles.backLink}>
                  <Text style={styles.backLinkText}>Change identity details?</Text>
                </TouchableOpacity>
              )}
            </GlassCard>
          </Animated.View>

          <View style={styles.footer}>
            <Globe size={14} color={theme.colors.textSecondary} />
            <Text style={styles.footerText}>SECURE INSTANCE: INDIA_NORTH_01</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  logoSection: { alignItems: 'center', marginBottom: 50 },
  logoBadge: { 
    width: 80, 
    height: 80, 
    borderRadius: 24, 
    backgroundColor: theme.colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: `0 10px 30px ${theme.colors.primary}80`, // 80 is ~0.5 opacity in hex
      },
      default: {
        shadowColor: theme.colors.primary,
        shadowRadius: 20,
        shadowOpacity: 0.5,
        elevation: 15,
      }
    })
  },
  brandName: { color: theme.colors.text, fontSize: 44, fontWeight: '900', letterSpacing: -2, marginTop: 20 },
  tagline: { color: theme.colors.primaryLight, fontSize: 12, fontWeight: '800', letterSpacing: 2, marginTop: 5, opacity: 0.8 },
  cardWrapper: { width: '100%', maxWidth: 450 },
  loginCard: { width: '100%' },
  cardTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  cardSubtitle: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 30 },
  rolePicker: { flexDirection: 'row', gap: 8, marginBottom: 25 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  roleBtnActive: { backgroundColor: 'rgba(29, 158, 117, 0.1)', borderColor: theme.colors.primary },
  roleBtnText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800' },
  roleBtnActiveText: { color: theme.colors.primaryLight },
  inputContainer: { marginBottom: 30 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, height: 64, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  prefix: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginLeft: 15, marginRight: 10, opacity: 0.8 },
  input: { flex: 1, color: theme.colors.text, fontSize: 18, fontWeight: '600', ...Platform.select({ web: { outlineStyle: 'none' }}) },
  errorText: { color: theme.colors.error, fontSize: 12, fontWeight: '600', marginTop: 8, marginLeft: 5 },
  otpWrapper: { alignItems: 'center' },
  otpInput: { color: theme.colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center', width: '100%', ...Platform.select({ web: { outlineStyle: 'none' }}) },
  actionBtn: { width: '100%' },
  backLink: { marginTop: 20, alignItems: 'center' },
  backLinkText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' },
  footer: { marginTop: 60, flexDirection: 'row', alignItems: 'center', gap: 10, opacity: 0.4 },
  footerText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 }
});
