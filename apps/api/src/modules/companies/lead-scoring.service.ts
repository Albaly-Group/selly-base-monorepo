import { Injectable } from '@nestjs/common';
import { Companies } from '../../entities/Companies';

/**
 * Lead Scoring Service
 * Calculates lead scores based on various company attributes
 */

export interface LeadScoreBreakdown {
  dataQuality: number;
  companySize: number;
  industry: number;
  location: number;
  engagement: number;
  verification: number;
  total: number;
}

export interface ScoringWeights {
  dataQuality: number;
  companySize: number;
  industry: number;
  location: number;
  engagement: number;
  verification: number;
}

@Injectable()
export class LeadScoringService {
  // Default scoring weights (can be customized per organization)
  private defaultWeights: ScoringWeights = {
    dataQuality: 0.25, // 25%
    companySize: 0.2, // 20%
    industry: 0.15, // 15%
    location: 0.15, // 15%
    engagement: 0.15, // 15%
    verification: 0.1, // 10%
  };

  /**
   * Calculate lead score for a company
   * @param company Company entity
   * @param weights Optional custom scoring weights
   * @returns Lead score (0-100) with breakdown
   */
  calculateLeadScore(
    company: Companies,
    weights?: Partial<ScoringWeights>,
  ): { score: number; breakdown: LeadScoreBreakdown } {
    const scoringWeights = { ...this.defaultWeights, ...weights };

    // Calculate individual component scores (0-100 scale)
    const dataQualityScore = this.scoreDataQuality(company);
    const companySizeScore = this.scoreCompanySize(company);
    const industryScore = this.scoreIndustry(company);
    const locationScore = this.scoreLocation(company);
    const engagementScore = this.scoreEngagement(company);
    const verificationScore = this.scoreVerification(company);

    // Calculate weighted total score
    const totalScore = Math.round(
      dataQualityScore * scoringWeights.dataQuality +
        companySizeScore * scoringWeights.companySize +
        industryScore * scoringWeights.industry +
        locationScore * scoringWeights.location +
        engagementScore * scoringWeights.engagement +
        verificationScore * scoringWeights.verification,
    );

    return {
      score: Math.min(100, Math.max(0, totalScore)), // Clamp to 0-100
      breakdown: {
        dataQuality: dataQualityScore,
        companySize: companySizeScore,
        industry: industryScore,
        location: locationScore,
        engagement: engagementScore,
        verification: verificationScore,
        total: totalScore,
      },
    };
  }

  /**
   * Calculate bulk lead scores for multiple companies
   */
  calculateBulkLeadScores(
    companies: Companies[],
    weights?: Partial<ScoringWeights>,
  ): Array<{
    companyId: string;
    score: number;
    breakdown: LeadScoreBreakdown;
  }> {
    return companies.map((company) => {
      const result = this.calculateLeadScore(company, weights);
      return {
        companyId: company.id,
        ...result,
      };
    });
  }

  /**
   * Score data quality (0-100)
   * Based on completeness and accuracy of company data
   */
  private scoreDataQuality(company: Companies): number {
    // Use existing data_quality_score if available
    if (
      company.dataQualityScore !== null &&
      company.dataQualityScore !== undefined
    ) {
      return Number(company.dataQualityScore) * 100;
    }

    // Otherwise calculate based on field completeness
    let score = 0;
    const fields = [
      company.nameEn,
      company.nameTh,
      // company.primaryRegistrationNo,
      company.businessDescription,
      company.addressLine1,
      company.primaryEmail,
      company.primaryPhone,
      company.websiteUrl,
      company.companySize,
    ];

    const filledFields = fields.filter(
      (field) => field !== null && field !== undefined && field !== '',
    ).length;
    score = (filledFields / fields.length) * 100;

    return Math.round(score);
  }

  /**
   * Score company size (0-100)
   * Larger companies generally score higher
   */
  private scoreCompanySize(company: Companies): number {
    const sizeScores: Record<string, number> = {
      enterprise: 100,
      large: 80,
      medium: 60,
      small: 40,
      micro: 20,
    };

    if (company.companySize && sizeScores[company.companySize]) {
      return sizeScores[company.companySize];
    }

    // If no size but has employee count estimate
    if (company.employeeCountEstimate) {
      if (company.employeeCountEstimate >= 1000) return 100;
      if (company.employeeCountEstimate >= 250) return 80;
      if (company.employeeCountEstimate >= 50) return 60;
      if (company.employeeCountEstimate >= 10) return 40;
      return 20;
    }

    return 50; // Default neutral score
  }

  /**
   * Score industry (0-100)
   * High-value industries score higher
   * Note: Industry data is now stored via foreign key to ref_industry_codes
   * To enable full industry scoring, load the primaryIndustry relation
   */
  private scoreIndustry(company: Companies): number {
    // Industry data is now stored via foreign key to ref_industry_codes
    // For detailed scoring, the primaryIndustry relation would need to be loaded
    // and the industry code checked against high/medium value industries

    // If primary industry is set, give a moderate score
    if (company.primaryIndustryId) {
      return 75;
    }

    return 50; // No industry data
  }

  /**
   * Score location (0-100)
   * Key business hubs score higher
   * Note: Location data is now stored via foreign key to ref_regions
   * To enable full location scoring, load the primaryRegion relation
   */
  private scoreLocation(company: Companies): number {
    // If primary region is set, give a moderate score
    // For detailed scoring, the primaryRegion relation would need to be loaded
    if (company.primaryRegionId) {
      return 75;
    }

    return 50; // No location data
  }

  /**
   * Score engagement (0-100)
   * Based on website, social media, and contact availability
   */
  private scoreEngagement(company: Companies): number {
    let score = 0;

    // Has website
    if (company.websiteUrl) score += 30;

    // Has LinkedIn
    if (company.linkedinUrl) score += 25;

    // Has Facebook
    if (company.facebookUrl) score += 15;

    // Has email
    if (company.primaryEmail) score += 20;

    // Has phone
    if (company.primaryPhone) score += 10;

    return Math.min(100, score);
  }

  /**
   * Score verification status (0-100)
   * Verified companies score higher
   */
  private scoreVerification(company: Companies): number {
    const statusScores: Record<string, number> = {
      verified: 100,
      unverified: 50,
      disputed: 25,
      inactive: 0,
    };

    return company.verificationStatus
      ? (statusScores[company.verificationStatus] ?? 50)
      : 50;
  }

  /**
   * Smart filtering: Filter companies by minimum lead score
   */
  filterByLeadScore(
    companies: Companies[],
    minScore: number,
    weights?: Partial<ScoringWeights>,
  ): Array<{
    company: Companies;
    score: number;
    breakdown: LeadScoreBreakdown;
  }> {
    const scored = companies.map((company) => {
      const result = this.calculateLeadScore(company, weights);
      return {
        company,
        ...result,
      };
    });

    return scored
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score); // Sort by score descending
  }

  /**
   * Get scoring recommendations for improving a company's lead score
   */
  getImprovementRecommendations(company: Companies): string[] {
    const recommendations: string[] = [];
    const { breakdown } = this.calculateLeadScore(company);

    if (breakdown.dataQuality < 70) {
      recommendations.push(
        'Complete missing company information (description, contact details, address)',
      );
    }

    if (breakdown.engagement < 60) {
      recommendations.push(
        'Add website URL, LinkedIn profile, or social media links',
      );
    }

    if (breakdown.verification < 100) {
      recommendations.push(
        'Verify company information to increase trust score',
      );
    }

    if (!company.primaryEmail && !company.primaryPhone) {
      recommendations.push('Add primary contact information (email or phone)');
    }

    if (!company.primaryIndustryId) {
      recommendations.push(
        'Specify industry classification for better targeting',
      );
    }

    return recommendations;
  }
}
