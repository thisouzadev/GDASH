import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASS = process.env.DEFAULT_ADMIN_PASSWORD || '123456';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name, 'weathers') private userModel: Model<UserDocument>,
    // @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  /** Seed do usuário admin padrão */
  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminExists = await this.userModel.findOne({ email: ADMIN_EMAIL }).exec();

    if (!adminExists) {
      console.log('Criando usuário administrador padrão...');
      const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);

      const adminUser = new this.userModel({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Administrador Padrão',
        role: 'admin',
      });

      await adminUser.save();
      console.log(`Usuário padrão criado: ${ADMIN_EMAIL} / ${ADMIN_PASS}`);
    }
  }

  /** Buscar usuário pelo email (para AuthService) */
  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /** CRUD */

  // Criar usuário
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    try {
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      return await createdUser.save();
    } catch (error: any) {
      if (error.code === 11000 && error.keyValue.email) {
        throw new ConflictException(`O email ${error.keyValue.email} já está cadastrado.`);
      }
      throw error;
    }
  }

  // Listar todos usuários
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  // Buscar usuário por ID
  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // Atualizar usuário
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
    const updateData: any = { ...updateUserDto };

    // Re-hash da senha se for fornecida
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  // Remover usuário
  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
