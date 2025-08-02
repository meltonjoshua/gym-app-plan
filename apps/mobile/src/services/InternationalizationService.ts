import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import pt from '../locales/pt.json';
import it from '../locales/it.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import zh from '../locales/zh.json';
import ar from '../locales/ar.json';
import ru from '../locales/ru.json';
import hi from '../locales/hi.json';

/**
 * Internationalization Service
 * Provides multi-language support for FitTracker Pro
 */
export class InternationalizationService {
  private static instance: InternationalizationService;
  private i18n: I18n;
  private currentLocale: string;
  private supportedLocales: string[];
  private rtlLocales: string[];

  private constructor() {
    this.i18n = new I18n();
    this.supportedLocales = [
      'en', 'es', 'fr', 'de', 'pt', 'it', 
      'ja', 'ko', 'zh', 'ar', 'ru', 'hi'
    ];
    this.rtlLocales = ['ar', 'he', 'fa', 'ur'];
    this.currentLocale = 'en';
    
    this.initializeTranslations();
  }

  public static getInstance(): InternationalizationService {
    if (!InternationalizationService.instance) {
      InternationalizationService.instance = new InternationalizationService();
    }
    return InternationalizationService.instance;
  }

  /**
   * Initialize the i18n system with translations and locale detection
   */
  async initialize(): Promise<void> {
    try {
      // Load saved locale preference
      const savedLocale = await AsyncStorage.getItem('user_locale');
      
      if (savedLocale && this.supportedLocales.includes(savedLocale)) {
        this.currentLocale = savedLocale;
      } else {
        // Auto-detect from device settings
        const deviceLocales = getLocales();
        const detectedLocale = deviceLocales[0]?.languageCode || 'en';
        
        if (this.supportedLocales.includes(detectedLocale)) {
          this.currentLocale = detectedLocale;
        }
      }

      // Set the locale
      this.i18n.locale = this.currentLocale;
      this.i18n.enableFallback = true;
      this.i18n.defaultLocale = 'en';

      console.log(`Internationalization initialized with locale: ${this.currentLocale}`);
    } catch (error) {
      console.error('I18n Initialization Error:', error);
      this.i18n.locale = 'en'; // Fallback to English
    }
  }

  /**
   * Get current locale
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Set locale and save preference
   */
  async setLocale(locale: string): Promise<void> {
    if (!this.supportedLocales.includes(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    try {
      this.currentLocale = locale;
      this.i18n.locale = locale;
      
      // Save preference
      await AsyncStorage.setItem('user_locale', locale);
      
      console.log(`Locale changed to: ${locale}`);
    } catch (error) {
      console.error('Locale Change Error:', error);
      throw error;
    }
  }

  /**
   * Get list of supported locales with their native names
   */
  getSupportedLocales(): LocaleInfo[] {
    return [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
    ];
  }

  /**
   * Check if current locale is RTL
   */
  isRTL(): boolean {
    return this.rtlLocales.includes(this.currentLocale);
  }

  /**
   * Translate a key with optional interpolation
   */
  t(key: string, options?: any): string {
    return this.i18n.t(key, options);
  }

  /**
   * Translate with pluralization
   */
  tp(key: string, count: number, options?: any): string {
    const pluralOptions = { ...options, count };
    return this.i18n.t(key, pluralOptions);
  }

  /**
   * Get localized date format
   */
  getDateFormat(): string {
    const dateFormats: { [key: string]: string } = {
      'en': 'MM/DD/YYYY',
      'es': 'DD/MM/YYYY',
      'fr': 'DD/MM/YYYY',
      'de': 'DD.MM.YYYY',
      'pt': 'DD/MM/YYYY',
      'it': 'DD/MM/YYYY',
      'ja': 'YYYY/MM/DD',
      'ko': 'YYYY.MM.DD',
      'zh': 'YYYY/MM/DD',
      'ar': 'DD/MM/YYYY',
      'ru': 'DD.MM.YYYY',
      'hi': 'DD/MM/YYYY'
    };

    return dateFormats[this.currentLocale] || 'MM/DD/YYYY';
  }

  /**
   * Get localized time format
   */
  getTimeFormat(): string {
    const timeFormats: { [key: string]: string } = {
      'en': 'h:mm A',
      'es': 'HH:mm',
      'fr': 'HH:mm',
      'de': 'HH:mm',
      'pt': 'HH:mm',
      'it': 'HH:mm',
      'ja': 'HH:mm',
      'ko': 'A h:mm',
      'zh': 'HH:mm',
      'ar': 'HH:mm',
      'ru': 'HH:mm',
      'hi': 'HH:mm'
    };

    return timeFormats[this.currentLocale] || 'h:mm A';
  }

  /**
   * Get localized number format
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.getLocaleForIntl(), options).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Get localized currency format
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    try {
      return new Intl.NumberFormat(this.getLocaleForIntl(), {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  }

  /**
   * Get localized distance format
   */
  formatDistance(distanceKm: number): string {
    const useImperial = this.currentLocale === 'en' && this.isUSLocale();
    
    if (useImperial) {
      const miles = distanceKm * 0.621371;
      return `${this.formatNumber(miles, { maximumFractionDigits: 2 })} ${this.t('units.miles')}`;
    } else {
      return `${this.formatNumber(distanceKm, { maximumFractionDigits: 2 })} ${this.t('units.km')}`;
    }
  }

  /**
   * Get localized weight format
   */
  formatWeight(weightKg: number): string {
    const useImperial = this.currentLocale === 'en' && this.isUSLocale();
    
    if (useImperial) {
      const pounds = weightKg * 2.20462;
      return `${this.formatNumber(pounds, { maximumFractionDigits: 1 })} ${this.t('units.lbs')}`;
    } else {
      return `${this.formatNumber(weightKg, { maximumFractionDigits: 1 })} ${this.t('units.kg')}`;
    }
  }

  /**
   * Get localized height format
   */
  formatHeight(heightCm: number): string {
    const useImperial = this.currentLocale === 'en' && this.isUSLocale();
    
    if (useImperial) {
      const totalInches = heightCm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}' ${inches}"`;
    } else {
      return `${this.formatNumber(heightCm, { maximumFractionDigits: 0 })} ${this.t('units.cm')}`;
    }
  }

  /**
   * Get workout-specific translations
   */
  getWorkoutTranslations(): WorkoutTranslations {
    return {
      exercises: {
        squat: this.t('exercises.squat'),
        deadlift: this.t('exercises.deadlift'),
        benchPress: this.t('exercises.benchPress'),
        pullUp: this.t('exercises.pullUp'),
        pushUp: this.t('exercises.pushUp'),
        plank: this.t('exercises.plank'),
        burpee: this.t('exercises.burpee'),
        lunges: this.t('exercises.lunges'),
        bicepCurl: this.t('exercises.bicepCurl'),
        shoulderPress: this.t('exercises.shoulderPress')
      },
      muscleGroups: {
        chest: this.t('muscleGroups.chest'),
        back: this.t('muscleGroups.back'),
        shoulders: this.t('muscleGroups.shoulders'),
        arms: this.t('muscleGroups.arms'),
        legs: this.t('muscleGroups.legs'),
        glutes: this.t('muscleGroups.glutes'),
        core: this.t('muscleGroups.core'),
        cardio: this.t('muscleGroups.cardio')
      },
      workoutTypes: {
        strength: this.t('workoutTypes.strength'),
        cardio: this.t('workoutTypes.cardio'),
        flexibility: this.t('workoutTypes.flexibility'),
        hiit: this.t('workoutTypes.hiit'),
        yoga: this.t('workoutTypes.yoga'),
        pilates: this.t('workoutTypes.pilates'),
        crossfit: this.t('workoutTypes.crossfit'),
        bodyweight: this.t('workoutTypes.bodyweight')
      }
    };
  }

  /**
   * Get nutrition-specific translations
   */
  getNutritionTranslations(): NutritionTranslations {
    return {
      macros: {
        protein: this.t('nutrition.protein'),
        carbs: this.t('nutrition.carbs'),
        fat: this.t('nutrition.fat'),
        fiber: this.t('nutrition.fiber'),
        sugar: this.t('nutrition.sugar'),
        sodium: this.t('nutrition.sodium')
      },
      meals: {
        breakfast: this.t('meals.breakfast'),
        lunch: this.t('meals.lunch'),
        dinner: this.t('meals.dinner'),
        snack: this.t('meals.snack'),
        preWorkout: this.t('meals.preWorkout'),
        postWorkout: this.t('meals.postWorkout')
      },
      foodCategories: {
        fruits: this.t('foodCategories.fruits'),
        vegetables: this.t('foodCategories.vegetables'),
        grains: this.t('foodCategories.grains'),
        protein: this.t('foodCategories.protein'),
        dairy: this.t('foodCategories.dairy'),
        fats: this.t('foodCategories.fats'),
        beverages: this.t('foodCategories.beverages')
      }
    };
  }

  /**
   * Get error messages in current language
   */
  getErrorMessage(errorCode: string, fallback: string = 'An error occurred'): string {
    const errorKey = `errors.${errorCode}`;
    const translated = this.i18n.t(errorKey);
    
    // If translation is the same as key, return fallback
    return translated === errorKey ? fallback : translated;
  }

  /**
   * Get success messages in current language
   */
  getSuccessMessage(messageCode: string, fallback: string = 'Success'): string {
    const messageKey = `success.${messageCode}`;
    const translated = this.i18n.t(messageKey);
    
    return translated === messageKey ? fallback : translated;
  }

  // Private helper methods
  private initializeTranslations(): void {
    this.i18n.translations = {
      en, es, fr, de, pt, it, ja, ko, zh, ar, ru, hi
    };
  }

  private getLocaleForIntl(): string {
    // Map our locale codes to Intl-compatible locale codes
    const localeMapping: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'pt': 'pt-BR',
      'it': 'it-IT',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ar': 'ar-SA',
      'ru': 'ru-RU',
      'hi': 'hi-IN'
    };

    return localeMapping[this.currentLocale] || 'en-US';
  }

  private isUSLocale(): boolean {
    // In a real app, you might check device locale more precisely
    // For now, assume US for English locale
    return true;
  }
}

// Type definitions
export interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface WorkoutTranslations {
  exercises: { [key: string]: string };
  muscleGroups: { [key: string]: string };
  workoutTypes: { [key: string]: string };
}

export interface NutritionTranslations {
  macros: { [key: string]: string };
  meals: { [key: string]: string };
  foodCategories: { [key: string]: string };
}

export default InternationalizationService;