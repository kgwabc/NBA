import type { CardPosition } from "./db";

export const SALARY_CAP = 120;
export const REQUIRED_POSITIONS: CardPosition[] = ["PG", "SG", "SF", "PF", "C"];

export type DeckSlotInput = {
  position: CardPosition;
  card: { position: CardPosition; salary: number };
};

export type DeckValidationResult = {
  valid: boolean;
  errors: string[];
  totalSalary: number;
};

export function validateDeck(slots: DeckSlotInput[]): DeckValidationResult {
  const errors: string[] = [];

  if (slots.length !== REQUIRED_POSITIONS.length) {
    errors.push("5개 포지션을 모두 채워야 합니다.");
  }

  for (const pos of REQUIRED_POSITIONS) {
    const slot = slots.find((s) => s.position === pos);
    if (!slot) {
      errors.push(`${pos} 슬롯이 비어 있습니다.`);
    } else if (slot.card.position !== pos) {
      errors.push(`${pos} 슬롯에 맞지 않는 포지션의 카드입니다.`);
    }
  }

  const totalSalary = slots.reduce((sum, s) => sum + s.card.salary, 0);
  if (totalSalary > SALARY_CAP) {
    errors.push(`샐러리캡 초과: $${totalSalary}M / $${SALARY_CAP}M`);
  }

  return { valid: errors.length === 0, errors, totalSalary };
}
