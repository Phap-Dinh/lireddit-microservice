import { Field, Int, ObjectType, Directive } from 'type-graphql'
import { 
  BaseEntity, 
  Column, 
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm'

@Directive(`@key(fields: "id")`)
@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  title: string

  @Field()
  @Column()
  text: string

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  points: number

  @Field(() => Int)
  @Column()
  creatorId: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
