import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { TransactionType, TransactionTypeSchema } from '../types/common';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Category name cannot be empty'),
  icon: z.string().default('Tag'),
  color: z.string().default('#64748b'),
  type: TransactionTypeSchema,
  parentId: z.string().uuid().nullable().default(null),
});
export type CategoryProps = z.infer<typeof CategorySchema>;

export class Category {
  private props: CategoryProps;

  constructor(props: CategoryProps) {
    this.props = CategorySchema.parse(props);
  }

  static create(
    params: Omit<CategoryProps, 'id'> & { id?: string },
  ): Category {
    return new Category({
      id: params.id ?? uuidv4(),
      name: params.name,
      icon: params.icon ?? 'Tag',
      color: params.color ?? '#64748b',
      type: params.type,
      parentId: params.parentId ?? null,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get icon(): string {
    return this.props.icon;
  }

  get color(): string {
    return this.props.color;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get parentId(): string | null {
    return this.props.parentId;
  }

  toProps(): CategoryProps {
    return { ...this.props };
  }
}
