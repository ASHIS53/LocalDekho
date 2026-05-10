import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, useWindowDimensions, Image,
  ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera, Image as ImageIcon, Video, X, ArrowLeft,
  Check, IndianRupee, Type, Tag, Info,
  ChevronDown, Plus,
} from 'lucide-react-native';
import Animated, {
  FadeInUp, FadeInDown,
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSpring,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import { notificationAsync, NotificationFeedbackType, impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import axios from 'axios';

// ─────────────────────────────────────────
// DASHED ANIMATED BORDER
// ─────────────────────────────────────────
function DashedUploadZone({ onCamera, onGallery, images, disabled, onRemove, onSetMain }) {
  const opacity = useSharedValue(0.25);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.6, { duration: 1400 }), -1, true);
  }, []);
  const borderStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (images.length > 0) {
    return (
      <View style={dz.previewWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((uri, i) => (
            <View key={i} style={dz.previewCard}>
              <Image source={{ uri }} style={dz.previewImg} />
              {i === 0 && (
                <View style={dz.mainBadge}>
                  <Text style={dz.mainBadgeText}>MAIN</Text>
                </View>
              )}
              
              {!disabled && (
                <View style={dz.actions}>
                  <TouchableOpacity 
                    style={dz.removeBtn} 
                    onPress={() => onRemove(i)}
                  >
                    <X size={12} color="#fff" />
                  </TouchableOpacity>
                  {i !== 0 && (
                    <TouchableOpacity 
                      style={dz.setMainBtn} 
                      onPress={() => onSetMain(i)}
                    >
                      <Text style={dz.setMainText}>Set Main</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
          {images.length < 5 && !disabled && (
            <TouchableOpacity style={dz.addMore} onPress={onGallery}>
              <Plus size={22} color={theme.colors.primary} />
              <Text style={dz.addMoreText}>Add</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <Text style={dz.countText}>{images.length}/5 photos added</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onGallery} activeOpacity={0.85} disabled={disabled}>
      <LinearGradient
        colors={['rgba(29,158,117,0.12)', 'rgba(29,158,117,0.03)']}
        style={dz.zone}
      >
        <Animated.View style={[dz.dashedBorder, borderStyle]} />
        <Camera size={36} color={theme.colors.primary} />
        <Text style={dz.mainText}>Add Product Photos</Text>
        <Text style={dz.subText}>Tap to choose from gallery</Text>
        <Text style={dz.hint}>Up to 5 photos • JPG, PNG</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
const dz = StyleSheet.create({
  zone: {
    height: 200, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    gap: 8, marginBottom: 12,
    borderWidth: 1.5, borderColor: 'rgba(29,158,117,0.2)',
    borderStyle: 'dashed',
  },
  dashedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22, borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  mainText: {
    color: theme.colors.text,
    fontSize: 16, fontWeight: '800', letterSpacing: -0.3,
  },
  subText: { color: theme.colors.textSecondary, fontSize: 12 },
  hint: {
    color: theme.colors.primary, fontSize: 11,
    fontWeight: '700', opacity: 0.8,
  },
  previewWrap: { marginBottom: 12 },
  previewCard: {
    width: 110, height: 140, borderRadius: 16,
    overflow: 'hidden', marginRight: 10,
    borderWidth: 1.5, borderColor: 'rgba(29,158,117,0.3)',
  },
  previewImg: { width: '100%', height: '100%' },
  mainBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  mainBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  addMore: {
    width: 110, height: 140, borderRadius: 16,
    backgroundColor: 'rgba(29,158,117,0.08)',
    borderWidth: 1.5, borderColor: 'rgba(29,158,117,0.25)',
    borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  addMoreText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  countText: {
    color: theme.colors.textSecondary,
    fontSize: 11, textAlign: 'center', marginTop: 6,
  },
  actions: {
    position: 'absolute',
    top: 5,
    right: 5,
    gap: 5,
    alignItems: 'flex-end',
  },
  removeBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,82,82,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  setMainBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6,
  },
  setMainText: { color: '#fff', fontSize: 8, fontWeight: '800' },
});

// ─────────────────────────────────────────
// FLOATING LABEL INPUT
// ─────────────────────────────────────────
function FloatInput({ icon: Icon, label, value, onChange, keyboardType, placeholder, color, editable = true }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[fi.wrap, focused && { borderColor: color || theme.colors.primary }]}>
      <View style={[fi.iconBox, { backgroundColor: (color || theme.colors.primary) + '15' }]}>
        <Icon size={16} color={color || theme.colors.primary} />
      </View>
      <View style={fi.inputWrap}>
        <Text style={fi.label}>{label}</Text>
        <TextInput
          style={fi.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          editable={editable}
          placeholderTextColor="rgba(255,255,255,0.2)"
          keyboardType={keyboardType || 'default'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...(Platform.OS === 'web' ? { style: [fi.input, { outlineStyle: 'none' }] } : {})}
        />
      </View>
    </View>
  );
}
const fi = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 10,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  inputWrap: { flex: 1 },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 4,
  },
  input: {
    color: theme.colors.text,
    fontSize: 15, fontWeight: '700',
  },
});

// ─────────────────────────────────────────
// SIZE SELECTOR
// ─────────────────────────────────────────
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
function SizeSelector({ selected, onToggle, disabled }) {
  return (
    <View style={ss.wrap}>
      {ALL_SIZES.map(size => {
        const active = selected.includes(size);
        return (
          <TouchableOpacity
            key={size}
            onPress={() => !disabled && onToggle(size)}
            activeOpacity={0.8}
          >
            {active ? (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark || '#0D7A5A']}
                style={ss.pill}
              >
                <Text style={ss.pillTextActive}>{size}</Text>
              </LinearGradient>
            ) : (
              <View style={ss.pillInactive}>
                <Text style={ss.pillText}>{size}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const ss = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 100,
  },
  pillInactive: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 100, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pillText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '700' },
  pillTextActive: { color: '#fff', fontSize: 12, fontWeight: '800' },
});

// ─────────────────────────────────────────
// COLOR INPUT
// ─────────────────────────────────────────
const COLOR_PRESETS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C77DFF', '#FF9A3C', '#fff', '#222'];
function ColorPicker({ selected, onToggle, disabled }) {
  return (
    <View style={cp.wrap}>
      {COLOR_PRESETS.map(c => {
        const active = selected.includes(c);
        return (
          <TouchableOpacity
            key={c}
            onPress={() => !disabled && onToggle(c)}
            style={[cp.dot, { backgroundColor: c }, active && cp.dotActive]}
          >
            {active && <Check size={12} color={c === '#fff' ? '#000' : '#fff'} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const cp = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dot: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  dotActive: {
    borderWidth: 2.5, borderColor: theme.colors.primary,
    transform: [{ scale: 1.1 }],
  },
});

// ─────────────────────────────────────────
// CATEGORY DROPDOWN
// ─────────────────────────────────────────
const CATEGORIES = ['Saree', 'Suit', 'Kurti', 'Lehenga', 'Shirt', 'Jeans', 'Shoes', 'Jewellery', 'Other'];
function CategoryPicker({ value, onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={cat.trigger}
        onPress={() => !disabled && setOpen(!open)}
        activeOpacity={0.8}
      >
        <Tag size={16} color={theme.colors.primary} />
        <Text style={[cat.triggerText, !value && { color: theme.colors.textSecondary }]}>
          {value || 'Select Category'}
        </Text>
        <ChevronDown size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {open && (
        <Animated.View entering={FadeInUp.springify()} style={cat.dropdown}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[cat.option, value === c && cat.optionActive]}
              onPress={() => { onSelect(c); setOpen(false); }}
            >
              <Text style={[cat.optionText, value === c && { color: theme.colors.primary }]}>
                {c}
              </Text>
              {value === c && <Check size={14} color={theme.colors.primary} />}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
}
const cat = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 10,
  },
  triggerText: { flex: 1, color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  dropdown: {
    backgroundColor: '#16161F',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10, overflow: 'hidden',
  },
  option: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 13,
    paddingHorizontal: 16, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionActive: { backgroundColor: 'rgba(29,158,117,0.1)' },
  optionText: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
});

// ─────────────────────────────────────────
// GENDER SELECTOR
// ─────────────────────────────────────────
const GENDERS = ['Women', 'Men', 'Kids', 'All'];
function GenderSelector({ value, onSelect, disabled }) {
  return (
    <View style={gs.wrap}>
      {GENDERS.map(g => {
        const active = value === g;
        return (
          <TouchableOpacity
            key={g}
            onPress={() => !disabled && onSelect(g)}
            style={{ flex: 1 }}
            activeOpacity={0.8}
          >
            {active ? (
              <LinearGradient
                colors={[theme.colors.primary, '#0D7A5A']}
                style={gs.btn}
              >
                <Text style={gs.btnTextActive}>{g}</Text>
              </LinearGradient>
            ) : (
              <View style={gs.btnInactive}>
                <Text style={gs.btnText}>{g}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const gs = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8 },
  btn: { paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  btnInactive: {
    paddingVertical: 11, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  btnText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700' },
  btnTextActive: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

// ─────────────────────────────────────────
// SECTION LABEL
// ─────────────────────────────────────────
function SectionLabel({ text }) {
  return <Text style={sl.text}>{text}</Text>;
}
const sl = StyleSheet.create({
  text: {
    color: theme.colors.textSecondary,
    fontSize: 9, fontWeight: '900',
    letterSpacing: 1.8, marginBottom: 12, marginTop: 24,
  },
});

// ─────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────
export default function OwnerUpload({ navigation, route }) {
  const { shopId, product, editMode, viewMode } = route?.params || {};
  const { width } = useWindowDimensions();

  const [isViewOnly, setIsViewOnly] = useState(viewMode || false);
  const [images, setImages] = useState(product?.images || (product?.image ? [product.image] : []));
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || '');
  const [gender, setGender] = useState(product?.gender || '');
  const [sizes, setSizes] = useState(product?.sizes || []);
  const [colors, setColors] = useState(product?.colors || []);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const hPad = width >= 1024 ? width * 0.12 : 20;

  // Toggle size
  const toggleSize = (s) => {
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  // Toggle color
  const toggleColor = (c) => {
    setColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  // Pick images
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri).slice(0, 5);
      setImages(uris);
    }
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setMainImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      const [main] = newImages.splice(index, 1);
      newImages.unshift(main);
      return newImages;
    });
  };

  // Publish
  const handlePublish = async () => {
    if (!name.trim() || !price.trim()) {
      if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Error);
      Alert.alert('Missing Info', 'Product name aur price required hai!');
      return;
    }
    if (Platform.OS !== 'web') impactAsync(ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    try {
      if (editMode) {
        await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/api/products/${product.id}`, {
          name,
          price: Number(price),
          description,
          category,
          gender,
          sizes,
          colors,
          images
        });
      } else {
        await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/products/add`, {
          shopId,
          name,
          price: Number(price),
          description,
          category,
          gender,
          sizes,
          colors,
          images
        });
      }
      setSuccess(true);
      if (Platform.OS !== 'web') notificationAsync(NotificationFeedbackType.Success);
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e) {
      console.error('Failed to add product', e);
      Alert.alert('Error', 'Product save nahi hua. Backend check karo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={ms.root}>
      <LinearGradient colors={['#0D0D15', '#0A0A0F']} style={StyleSheet.absoluteFill} />

      {/* ── HEADER ── */}
      <Animated.View entering={FadeInDown.springify()} style={[ms.header, { paddingHorizontal: hPad }]}>
        <TouchableOpacity
          style={ms.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={ms.headerTitle}>
          {isViewOnly ? 'Product Details' : (editMode ? 'Edit Product' : 'Add Product')}
        </Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[ms.scroll, { paddingHorizontal: hPad }]}
      >

        {/* ── PHOTOS ── */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <SectionLabel text="PRODUCT PHOTOS" />
          <DashedUploadZone
            images={images}
            onGallery={pickImages}
            onCamera={openCamera}
            disabled={isViewOnly}
            onRemove={removeImage}
            onSetMain={setMainImage}
          />

          {/* Camera + Gallery row */}
          {images.length === 0 && !isViewOnly && (
            <View style={ms.mediaRow}>
              <TouchableOpacity style={ms.mediaBtn} onPress={openCamera} activeOpacity={0.8}>
                <Camera size={18} color={theme.colors.primary} />
                <Text style={ms.mediaBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ms.mediaBtn} onPress={pickImages} activeOpacity={0.8}>
                <ImageIcon size={18} color="#00C9FF" />
                <Text style={[ms.mediaBtnText, { color: '#00C9FF' }]}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ms.mediaBtn} activeOpacity={0.8}>
                <Video size={18} color="#FFD700" />
                <Text style={[ms.mediaBtnText, { color: '#FFD700' }]}>Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* ── BASIC INFO ── */}
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <SectionLabel text="BASIC INFO" />
          <FloatInput
            icon={Type}
            label="PRODUCT NAME"
            value={name}
            onChange={setName}
            placeholder="e.g. Silk Banarasi Saree"
            color={theme.colors.primary}
            editable={!isViewOnly}
          />
          <FloatInput
            icon={IndianRupee}
            label="PRICE (₹)"
            value={price}
            onChange={setPrice}
            placeholder="e.g. 3200"
            keyboardType="numeric"
            color="#00E676"
            editable={!isViewOnly}
          />
          <FloatInput
            icon={Info}
            label="DESCRIPTION (OPTIONAL)"
            value={description}
            onChange={setDescription}
            placeholder="Product ke baare mein kuch likho..."
            color="#00C9FF"
            editable={!isViewOnly}
          />
        </Animated.View>

        {/* ── CATEGORY ── */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <SectionLabel text="CATEGORY" />
          <CategoryPicker value={category} onSelect={setCategory} disabled={isViewOnly} />
        </Animated.View>

        {/* ── GENDER ── */}
        <Animated.View entering={FadeInUp.delay(230).springify()}>
          <SectionLabel text="FOR WHOM" />
          <GenderSelector value={gender} onSelect={setGender} disabled={isViewOnly} />
        </Animated.View>

        {/* ── SIZES ── */}
        <Animated.View entering={FadeInUp.delay(260).springify()}>
          <SectionLabel text="SIZES AVAILABLE" />
          <SizeSelector selected={sizes} onToggle={toggleSize} disabled={isViewOnly} />
        </Animated.View>

        {/* ── COLORS ── */}
        <Animated.View entering={FadeInUp.delay(290).springify()}>
          <SectionLabel text="COLORS AVAILABLE" />
          <ColorPicker selected={colors} onToggle={toggleColor} disabled={isViewOnly} />
        </Animated.View>

        {/* ── PUBLISH BUTTON ── */}
        <Animated.View entering={FadeInUp.delay(320).springify()} style={ms.footer}>
          {/* Summary chips */}
          <View style={ms.summaryRow}>
            {images.length > 0 && (
              <View style={ms.chip}>
                <Text style={ms.chipText}>{images.length} photos</Text>
              </View>
            )}
            {sizes.length > 0 && (
              <View style={ms.chip}>
                <Text style={ms.chipText}>{sizes.length} sizes</Text>
              </View>
            )}
            {colors.length > 0 && (
              <View style={ms.chip}>
                <Text style={ms.chipText}>{colors.length} colors</Text>
              </View>
            )}
          </View>

          <GradientButton
            title={
              isViewOnly 
                ? 'EDIT PRODUCT' 
                : (success ? (editMode ? '✓ Updated!' : '✓ Published!') : (editMode ? 'Update Product' : 'Publish Product'))
            }
            loading={loading}
            success={success}
            onPress={isViewOnly ? () => setIsViewOnly(false) : handlePublish}
          />

          <Text style={ms.hint}>
            Product admin approval ke baad live hoga
          </Text>
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const ms = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 16, fontWeight: '800', letterSpacing: -0.4,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  scroll: { paddingTop: 8, paddingBottom: 20 },
  mediaRow: {
    flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 4,
  },
  mediaBtn: {
    flex: 1, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  mediaBtnText: {
    color: theme.colors.primary,
    fontSize: 12, fontWeight: '800',
  },
  footer: { marginTop: 28, gap: 14 },
  summaryRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: 'rgba(29,158,117,0.12)',
    borderRadius: 100, borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.25)',
  },
  chipText: {
    color: theme.colors.primary,
    fontSize: 11, fontWeight: '700',
  },
  hint: {
    color: theme.colors.textSecondary,
    fontSize: 11, textAlign: 'center',
  },
});