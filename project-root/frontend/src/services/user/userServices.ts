import axios, { type AxiosResponse } from "axios";
import type { User } from "./types/user";

class UserServices {
  private baseUrl = `${import.meta.env.VITE_API_URL}/users`;

  // Cria usuário e trata email duplicado
  async createUser(user: User): Promise<AxiosResponse<User>> {
    try {
      const response = await axios.post<User>(this.baseUrl, user);
      return response;
    } catch (err: any) {
      // Se email já existir
      if (err.response?.status === 409) {
        throw new Error("Email já cadastrado.");
      }
      throw err;
    }
  }
}

export default new UserServices();
