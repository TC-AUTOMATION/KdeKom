interface MissionInput {
  amount_billed: number; // L
  initial_fees: number; // N
  agency_fees: number; // P
  fixed_fees: number; // Q
  management_fees: number; // R
  ml_amount: number; // S
  lt_amount: number; // T
  apporteur_commission: number; // B
  has_parrain: boolean;
}

interface DistributionInput {
  person_id: string;
  percentage: number;
}

interface CalculationResult {
  remainder_after_initial: number; // O
  remainder_before_commissions: number; // U
  parrain_commission: number; // D
  base_for_distribution: number; // V
  reliquat: number; // AU
  distributions: {
    person_id: string;
    amount: number;
  }[];
}

export class FinanceService {
  static calculateMission(
    mission: MissionInput,
    distributions: DistributionInput[]
  ): CalculationResult {
    // 1. Reste après première déduction (O) = L - N
    const remainder_after_initial = mission.amount_billed - mission.initial_fees;

    // 2. Reste avant commissions (U) = O - P - Q - R - S - T
    const remainder_before_commissions =
      remainder_after_initial -
      mission.agency_fees -
      mission.fixed_fees -
      mission.management_fees -
      mission.ml_amount -
      mission.lt_amount;

    // 3. Commission Parrain (D) = 5% de U si parrain existe
    // Note: If U is negative, commission should probably be 0, but following Excel logic strictly:
    // Excel: =IF(C="", 0, U*5%)
    const parrain_commission = mission.has_parrain
      ? remainder_before_commissions * 0.05
      : 0;

    // 4. Base de répartition (V) = U - B - D
    const base_for_distribution =
      remainder_before_commissions -
      mission.apporteur_commission -
      parrain_commission;

    // 5. Calculate Distributions
    let total_distributed_percentage = 0;
    const calculated_distributions = distributions.map((dist) => {
      total_distributed_percentage += dist.percentage;
      return {
        person_id: dist.person_id,
        amount: base_for_distribution * dist.percentage,
      };
    });

    // 6. Reliquat (AU) = V * (100% - sum(percentages))
    const reliquat_percentage = 1 - total_distributed_percentage;
    const reliquat = base_for_distribution * reliquat_percentage;

    return {
      remainder_after_initial: this.round(remainder_after_initial),
      remainder_before_commissions: this.round(remainder_before_commissions),
      parrain_commission: this.round(parrain_commission),
      base_for_distribution: this.round(base_for_distribution),
      reliquat: this.round(reliquat),
      distributions: calculated_distributions.map((d) => ({
        ...d,
        amount: this.round(d.amount),
      })),
    };
  }

  private static round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}