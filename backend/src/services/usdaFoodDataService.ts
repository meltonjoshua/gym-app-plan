import axios, { AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

export interface USDAFoodSearchResult {
  fdcId: number;
  description: string;
  brandName?: string;
  brandOwner?: string;
  foodCategory?: string;
  dataType: string;
  score?: number;
}

export interface USDAFoodDetails {
  fdcId: number;
  description: string;
  brandName?: string;
  brandOwner?: string;
  foodCategory?: string;
  dataType: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }>;
  foodPortions?: Array<{
    id: number;
    amount: number;
    modifier: string;
    gramWeight: number;
    sequenceNumber: number;
  }>;
  ingredients?: string;
}

export interface USDASearchParams {
  query: string;
  dataType?: string[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: 'dataType.keyword' | 'lowercaseDescription.keyword' | 'fdcId' | 'publishedDate';
  sortOrder?: 'asc' | 'desc';
  brandOwner?: string;
}

class USDAFoodDataService {
  private readonly baseUrl = 'https://api.nal.usda.gov/fdc/v1';
  private readonly apiKey: string;
  private readonly rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;

  constructor() {
    this.apiKey = process.env.USDA_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('USDA API key not provided. Food search will be limited.');
    }
  }

  private async makeRequest<T>(endpoint: string, params: any = {}): Promise<T> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    try {
      const response: AxiosResponse<T> = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: {
          api_key: this.apiKey,
          ...params
        },
        timeout: 10000
      });

      return response.data;
    } catch (error: any) {
      logger.error('USDA API request failed:', {
        endpoint,
        error: error.message,
        status: error.response?.status
      });
      throw new Error(`USDA API request failed: ${error.message}`);
    }
  }

  async searchFoods(searchParams: USDASearchParams): Promise<{
    foods: USDAFoodSearchResult[];
    totalHits: number;
    currentPage: number;
    totalPages: number;
  }> {
    const {
      query,
      dataType = ['foundation', 'sr_legacy', 'survey', 'branded'],
      pageSize = 25,
      pageNumber = 1,
      sortBy = 'dataType.keyword',
      sortOrder = 'asc',
      brandOwner
    } = searchParams;

    const params = {
      query,
      dataType,
      pageSize: Math.min(pageSize, 200), // USDA API max
      pageNumber,
      sortBy,
      sortOrder,
      ...(brandOwner && { brandOwner })
    };

    const response = await this.makeRequest<{
      foods: USDAFoodSearchResult[];
      totalHits: number;
      currentPage: number;
      totalPages: number;
    }>('/foods/search', params);

    return response;
  }

  async getFoodDetails(fdcId: number, nutrients?: number[]): Promise<USDAFoodDetails> {
    const params = nutrients ? { nutrients } : {};
    
    const response = await this.makeRequest<USDAFoodDetails>(`/food/${fdcId}`, params);
    return response;
  }

  async getFoodsByIds(fdcIds: number[]): Promise<USDAFoodDetails[]> {
    if (fdcIds.length === 0) return [];
    
    // USDA API supports batch requests with POST
    try {
      const response = await axios.post(`${this.baseUrl}/foods`, {
        fdcIds,
        format: 'abridged',
        nutrients: this.getRequiredNutrientIds()
      }, {
        params: { api_key: this.apiKey },
        timeout: 15000
      });

      return response.data;
    } catch (error: any) {
      logger.error('USDA batch food request failed:', error.message);
      throw new Error(`USDA batch request failed: ${error.message}`);
    }
  }

  // Transform USDA data to our Food model format
  transformToFoodModel(usdaFood: USDAFoodDetails): any {
    const nutrition = this.extractNutrition(usdaFood.foodNutrients);
    
    return {
      fdcId: usdaFood.fdcId,
      description: usdaFood.description,
      brandName: usdaFood.brandName,
      brandOwner: usdaFood.brandOwner,
      foodCategory: usdaFood.foodCategory,
      dataType: usdaFood.dataType.toLowerCase(),
      
      nutritionPer100g: nutrition,
      
      servingSizes: usdaFood.foodPortions?.map(portion => ({
        amount: portion.amount,
        unit: portion.modifier,
        gramWeight: portion.gramWeight,
        description: portion.modifier
      })) || [],
      
      searchTerms: this.generateSearchTerms(usdaFood),
      commonNames: this.extractCommonNames(usdaFood.description),
      ingredients: usdaFood.ingredients ? [usdaFood.ingredients] : [],
      
      isCustom: false,
      isVerified: true,
      searchCount: 0
    };
  }

  private extractNutrition(nutrients: USDAFoodDetails['foodNutrients']): any {
    const nutritionMap = new Map();
    
    nutrients.forEach(nutrient => {
      nutritionMap.set(nutrient.nutrientNumber, nutrient.value);
    });

    return {
      calories: nutritionMap.get('208') || 0,           // Energy (kcal)
      protein: nutritionMap.get('203') || 0,           // Protein
      carbohydrates: nutritionMap.get('205') || 0,     // Carbohydrate, by difference
      fat: nutritionMap.get('204') || 0,               // Total lipid (fat)
      fiber: nutritionMap.get('291') || undefined,      // Fiber, total dietary
      sugar: nutritionMap.get('269') || undefined,      // Sugars, total including NLEA
      sodium: nutritionMap.get('307') || undefined,     // Sodium, Na
      cholesterol: nutritionMap.get('601') || undefined, // Cholesterol
      saturatedFat: nutritionMap.get('606') || undefined, // Fatty acids, total saturated
      transFat: nutritionMap.get('605') || undefined    // Fatty acids, total trans
    };
  }

  private generateSearchTerms(food: USDAFoodDetails): string[] {
    const terms = new Set<string>();
    
    // Split description into words
    const words = food.description.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    words.forEach(word => terms.add(word));
    
    // Add brand name words
    if (food.brandName) {
      food.brandName.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2)
        .forEach(word => terms.add(word));
    }
    
    return Array.from(terms);
  }

  private extractCommonNames(description: string): string[] {
    // Extract common names from description (basic implementation)
    const commonNames: string[] = [];
    
    // Look for parenthetical alternative names
    const parentheticalMatch = description.match(/\(([^)]+)\)/);
    if (parentheticalMatch) {
      commonNames.push(parentheticalMatch[1]);
    }
    
    return commonNames;
  }

  private getRequiredNutrientIds(): number[] {
    return [
      203, // Protein
      204, // Total lipid (fat)
      205, // Carbohydrate, by difference
      208, // Energy (kcal)
      269, // Sugars, total including NLEA
      291, // Fiber, total dietary
      307, // Sodium, Na
      601, // Cholesterol
      605, // Fatty acids, total trans
      606  // Fatty acids, total saturated
    ];
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.searchFoods({ query: 'apple', pageSize: 1 });
      return true;
    } catch (error) {
      logger.error('USDA API health check failed:', error);
      return false;
    }
  }
}

export const usdaFoodDataService = new USDAFoodDataService();
