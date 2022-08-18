import { ObjectType, Field, Int, Directive } from 'type-graphql'
import { 
  BaseEntity, 
  Column, 
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm'

// field (graphql) is non-nullable by default
// property (typescript) is non-nullable by default
// column (typeorm) is non-nullable by default 

@Directive(`@key(fields: "id")`)
@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column({ unique: true })
  username: string 

  @Field()
  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
