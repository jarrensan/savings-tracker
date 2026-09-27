import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const CategorizationRuleSchema = z.object({
  id: z.string().uuid(),
  pattern: z.string().min(1, 'Pattern cannot be empty'),
  matchField: z.enum(['cleanMerchant', 'rawDescription']).default('cleanMerchant'),
  categoryId: z.string().uuid(),
  priority: z.number().int().default(0),
  createdAt: z.date().default(() => new Date()),
});
export type CategorizationRuleProps = z.infer<typeof CategorizationRuleSchema>;

export class CategorizationRule {
  private props: CategorizationRuleProps;

  constructor(props: CategorizationRuleProps) {
    this.props = CategorizationRuleSchema.parse(props);
  }

  static create(
    params: Omit<CategorizationRuleProps, 'id' | 'createdAt'> & { id?: string },
  ): CategorizationRule {
    return new CategorizationRule({
      id: params.id ?? uuidv4(),
      pattern: params.pattern,
      matchField: params.matchField ?? 'cleanMerchant',
      categoryId: params.categoryId,
      priority: params.priority ?? 0,
      createdAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get pattern(): string {
    return this.props.pattern;
  }

  get matchField(): 'cleanMerchant' | 'rawDescription' {
    return this.props.matchField;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get priority(): number {
    return this.props.priority;
  }

  matches(targetText: string): boolean {
    if (!targetText || !this.props.pattern) return false;
    const normalizedTarget = targetText.toUpperCase();
    const normalizedPattern = this.props.pattern.toUpperCase();
    return normalizedTarget.includes(normalizedPattern);
  }

  toProps(): CategorizationRuleProps {
    return { ...this.props };
  }
}
